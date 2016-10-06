const {
  runAction,
  runActions,
  emptyState,
  runPipe,
  normalizePipe,
  normalizeState,
  buildPipes
} = require('./purefn')
const { stub } = require('sinon')
const assert = require('chai').assert
const { deepEqual: deep } = assert
const { test1Plugin, test1 } = require('./test/plugins/test1')
const { test1Pipe } = require('./test/pipes/test1')
const { testCall } = require('./test/pipes/test-call')
const { testMap } = require('./test/pipes/test-map')
const { testPanic } = require('./test/pipes/test-panic')
const { testEnd } = require('./test/pipes/test-end')
const { addToContext } = require('./actions')
const { logPlugin, log } = require('./plugins/log')
const { doubleCall } = require('./test/pipes/double-call')
const { passPayload } = require('./test/pipes/pass-payload')
const { merge } = require('ramda')

describe('purefn', () => {
  describe('runAction', () => {
    it('should write results to the context object', () => {
      let { action1, plugins } = setup('test-result1')
      return runAction(plugins, action1).then((result) => {
        assert(plugins.test1.calledWith(action1.payload), 'plugin was not called with action payload')
        deep(result.success, true)
        deep(result.payload, 'test-result1')
      })
    })

    it('should write errors to the error object', () => {
      let error = new Error('nope')
      let plugins = {
        test1: () => Promise.reject(error)
      }

      let action = test1('result')

      return runAction(plugins, action).then((result) => {
        deep(result.success, false)
        deep(result.error, error)
      })
    })

    it('should throw if plugin is not registered', () => {
      let action = {
        type: 'notRegistered'
      }

      try {
        runAction({}, action)
      } catch (e) {
        deep(e.message, '"notRegistered" is not a registered plugin.')
        return
      }

      throw new Error('Exception was not thrown.')
    })
  })

  describe('runActions', () => {
    it('should run multiple actions and return an array of results', () => {
      let { plugins } = setup('test-result1', 'test-result2')
      let action1 = testAction('test1', 'tr1')
      let action2 = testAction('test2', 'tr2')
      let actions = [action1, action2]
      return runActions(plugins, actions).then((result) => {
        deep(result, {
          context: {
            tr1: 'test-result1',
            tr2: 'test-result2'
          },
          errors: {}
        })
      })
    })
  })

  describe('emptyState', () => {
    it('return an empty state object', () => {
      deep(emptyState(), {
        context: {},
        payload: {},
        errors: {}
      })
    })
  })

  describe('buildPipes', () => {
    it('should be able to run a pipe', () => {
      let plugins = {
        test1: test1Plugin
      }

      let pipes = {
        test1: test1Pipe
      }

      let { test1 } = buildPipes(plugins, pipes)

      return test1().then((state) => {
        deep(state.payload, {
          result: 'test1-result'
        })
      })
    })
  })

  describe('runPipe', () => {
    it('should be able to run a pipe', () => {
      let plugins = {
        test1: test1Plugin
      }

      return runPipe(plugins, test1Pipe, emptyState()).then((state) => {
        deep(state.payload, {
          result: 'test1-result'
        })
      })
    })

    it('should pass the payload through the pipe', () => {
      let payload = {
        foo: 'bar'
      }

      return runPipe({}, passPayload, payload).then((state) => {
        deep(state.payload, payload)
      })
    })

    it('should pass the context through the pipe', () => {
      let expectedState = merge(emptyState(), {
        context: {
          foo: 'bar'
        }
      })

      return runPipe({}, passPayload, expectedState).then((state) => {
        deep(state.context, expectedState.context)
      })
    })

    it('should pass the errors through the pipe', () => {
      let expectedState = merge(emptyState(), {
        errors: {
          foo: new Error('foo!')
        }
      })

      return runPipe({}, passPayload, expectedState).then((state) => {
        deep(state.errors, expectedState.errors)
      })
    })

    it('should write errors to the error object', () => {
      let error = new Error('nope')
      let plugins = {
        test1: () => Promise.reject(error)
      }

      let action = test1('result')

      let fn = () => action

      return runPipe(plugins, fn, emptyState()).then((state) => {
        deep(state.errors[action.contextKey], error)
      })
    })

    it('should perform all actions before returning', () => {
      return runPipe({}, doubleCall, emptyState()).then((state) => {
        deep(state.payload, {
          c1: true,
          c2: true
        })
      })
    })

    describe('call', () => {
      it('should call subpipe', () => {
        let { plugins } = setup()

        let expectedState = {
          foo: 'bar',
          sub: 'pipe'
        }

        return runPipe(plugins, testCall, expectedState).then((state) => {
          deep(state.payload, expectedState)
        })
      })
    })

    describe('mapPipe', () => {
      it('should be able to map a pipe over results', () => {
        let { plugins } = setup()

        return runPipe(plugins, testMap, {}).then((state) => {
          let expectedPayload = [
            {id: 1, name: 'User 1'},
            {id: 2, name: 'User 2'},
            {id: 3, name: 'User 3'}
          ]

          deep(state.payload.map(s => s.payload), expectedPayload)
        })
      })
    })

    describe('panic', () => {
      it('should error out on panic', () => {
        let { plugins } = setup()

        return runPipe(plugins, testPanic, {}).then((state) => {
          throw new Error('This should not be called')
        }).catch((err) => {
          deep(err.message, 'Something bad happened!')
        })
      })
    })

    describe('end', () => {
      it('should be able to abort pipe', () => {
        let { plugins } = setup()

        return runPipe(plugins, testEnd, {}).then(({payload}) => {
          deep(payload, 2)
        })
      })
    })

    describe('addToContext', () => {
      it('should add to context', () => {
        let { plugins } = setup()

        let added = {
          foo: 'bar'
        }

        let fn = () => addToContext(added)

        return runPipe(plugins, fn, {}).then(({context}) => {
          deep(context, added)
        })
      })

      it('should allow multiple addToContext actions', () => {
        let pipe = []

        pipe.push(() => addToContext({
          one: 1
        }))

        pipe.push(() => addToContext({
          two: 2
        }))

        return runPipe({}, pipe, emptyState()).then((state) => {
          deep(state.context, {
            one: 1,
            two: 2
          })
        })
      })
    })
  })

  describe('normalizePipe', () => {
    it('should normalizePipe pipe to a flat array', () => {
      let fn1 = () => {}
      let fn2 = () => {}
      let fn3 = () => {}

      deep(normalizePipe(fn1), [fn1])
      deep(normalizePipe([fn1, [fn2, fn3]]), [fn1, fn2, fn3])
      deep(normalizePipe([fn1, fn2, fn3]), [fn1, fn2, fn3])
    })
  })

  describe('logPlugin', () => {
    it('should console.log message', () => {
      let plugins = {
        log: logPlugin
      }

      let fn = () => log('hi')

      stub(console, 'info')
      return runPipe(plugins, fn, {}).then(() => {
        assert(console.info.calledWith('hi'), 'console.info was not called with "hi"')
        console.info.restore()
      }).catch((e) => {
        console.info.restore()
        throw e
      })
    })
  })

  describe('normalizeState', () => {
    it('should convert value to state object', () => {
      let state = normalizeState(1)
      deep(state, {
        context: {},
        payload: 1,
        errors: {}
      })
    })

    it('should not change state object', () => {
      let s1 = {
        context: {},
        payload: 1,
        errors: {}
      }

      let state = normalizeState(s1)
      deep(state, s1)
    })

    it('should return an empty state if value is falsey', () => {
      let state = normalizeState()
      deep(state, emptyState())
    })
  })
})

function setup (testPluginResult1, testPluginResult2) {
  let action1 = testAction('test1')
  let action2 = testAction('test2')
  let plugins = {
    test1: stub().returns(Promise.resolve(testPluginResult1)),
    test2: stub().returns(Promise.resolve(testPluginResult2))
  }

  let state = emptyState()

  return { action1, action2, state, plugins }
}

function testAction (type = 'test', contextKey = 'testResult') {
  return {
    type,
    contextKey,
    payload: {
      foo: 'bar'
    }
  }
}
