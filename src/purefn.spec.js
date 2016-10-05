const {
  runAction,
  runActions,
  emptyState,
  runPipe,
  normalizePipe
} = require('./purefn')
const { stub } = require('sinon')
const assert = require('chai').assert
const deep = assert.deepEqual
const { test1Plugin, test1 } = require('./test/plugins/test1')
const { test1Pipe } = require('./test/pipes/test1')

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
