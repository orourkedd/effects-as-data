const { handleActions } = require('./handle-actions')
const { deepEqual } = require('assert')
const actions = require('./actions')
const { stub } = require('sinon')
const { run } = require('./run')
const handlers = require('./handlers/universal')

const { success, errorToObject, asyncify } = require('./util')

describe('handle-actions.js', () => {
  describe('handleActions', () => {
    it('should throw an exception if handler is not registered and indicate there are no handlers registered', () => {
      const noop = function() {}
      const actions = [{ type: 'dne' }]
      return handleActions(noop, {}, {}, actions)
        .then(() => {
          fail('handleActions did not throw')
        })
        .catch(e => {
          deepEqual(
            e.error.message,
            '"dne" is not a registered handler.  In fact, there are no registered handlers (first argument to the run function).'
          )
        })
    })

    it('should throw an exception if handler is not registered and list registered handlers', () => {
      const noop = function() {}
      const handlers2 = { foo: () => {}, bar: () => {}, baz: () => {} }
      const actions = [{ type: 'dne' }]
      return handleActions(noop, handlers2, {}, actions)
        .then(() => {
          fail('handleActions did not throw')
        })
        .catch(e => {
          deepEqual(
            e.error.message,
            '"dne" is not a registered handler.  Registered handlers are: foo, bar, baz.'
          )
        })
    })

    it('run a fn for the call action', () => {
      const fn = function*(payload) {
        return payload
      }
      const action = actions.call(fn, { foo: 'bar' })
      const config = {}
      return handleActions(run, handlers, config, [action]).then(results => {
        deepEqual(results[0], success({ foo: 'bar' }))
      })
    })

    it('run a fn for the call action asynchronously and return immediate success if action.asyncAction === true', () => {
      let called = false
      const fn = function*() {
        called = true
      }
      const action = asyncify(actions.call(fn, { foo: 'bar' }))
      const config = {}
      return handleActions(run, handlers, config, [action]).then(results => {
        deepEqual(results.length, 1)
        deepEqual(results[0], success())
        deepEqual(called, true)
      })
    })

    it('should use the call action handler is provided', () => {
      let fn = function*() {}
      let a = actions.call(fn, { foo: 'bar' })
      let callHandler = stub().returns(true)
      const handlers = {
        call: callHandler
      }

      return handleActions(() => {}, handlers, {}, [a]).then(results => {
        deepEqual(results.length, 1)
        deepEqual(results[0].payload, true)
        deepEqual(callHandler.firstCall.args[0], {
          type: 'call',
          payload: { foo: 'bar' },
          fn,
          asyncAction: false
        })
      })
    })

    it('should handle errors from effects-as-data functions that have been called using the call action', () => {
      const error = new Error('nope')
      const a = actions.call(testCalledFn, {})
      function* testCalledFn() {
        throw error
      }

      return handleActions(run, handlers, {}, [a]).then(results => {
        deepEqual(results[0].success, false)
        deepEqual(results[0].error.message, error.message)
      })
    })

    it('should normalize results to success objects', () => {
      const a = {
        type: 'test'
      }
      const handlers = {
        test: 'foo'
      }
      const run = () => {}
      return handleActions(run, handlers, {}, [a]).then(results => {
        deepEqual(results[0], {
          success: true,
          payload: 'foo'
        })
      })
    })

    it('should pass action, handlers and config into handler', () => {
      const a = {
        type: 'test'
      }
      const config = {
        foo: 'bar'
      }
      const handlers = {
        test: (action, handlers, config) => {
          return {
            action,
            handlers,
            config
          }
        }
      }
      const expected = {
        action: a,
        handlers,
        config
      }
      const run = () => {}
      return handleActions(run, handlers, config, [a]).then(results => {
        deepEqual(results[0].payload, expected)
      })
    })

    it('should support handlers as functions returning values', () => {
      const a = {
        type: 'test'
      }
      const handlers = {
        test: () => 'foo'
      }
      const run = () => {}
      return handleActions(run, handlers, {}, [a]).then(results => {
        deepEqual(results[0].payload, 'foo')
      })
    })

    it('should support handlers returning promises', () => {
      const a = {
        type: 'test'
      }
      const handlers = {
        test: () => Promise.resolve('foo')
      }
      const run = () => {}
      return handleActions(run, handlers, {}, [a]).then(results => {
        deepEqual(results[0].payload, 'foo')
      })
    })

    it('should support handlers returning values', () => {
      const a = {
        type: 'test'
      }
      const handlers = {
        test: 'foo'
      }
      const run = () => {}
      return handleActions(run, handlers, {}, [a]).then(results => {
        deepEqual(results[0].payload, 'foo')
      })
    })

    it('should handle promise rejections and normalize to a failure', () => {
      const a = {
        type: 'test'
      }
      const error = new Error('nope')
      const handlers = {
        test: () => Promise.reject(error)
      }
      const run = () => {}
      return handleActions(run, handlers, {}, [a]).then(results => {
        deepEqual(results, [
          {
            success: false,
            error: errorToObject(error)
          }
        ])
      })
    })

    it('should handle thrown errors and normalize to a failure', () => {
      const a = {
        type: 'test'
      }
      const error = new Error('nope')
      const handlers = {
        test: () => {
          throw error
        }
      }
      const run = () => {}
      return handleActions(run, handlers, {}, [a]).then(results => {
        deepEqual(results, [
          {
            success: false,
            error: errorToObject(error)
          }
        ])
      })
    })
  })
})
