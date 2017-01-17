const { handleActions } = require('./handle-actions')
const { deepEqual } = require('assert')
const { call } = require('./actions')
const { stub } = require('sinon')
const { run } = require('./run')
const { failure } = require('./util')

describe('handle-actions.js', () => {
  describe('handleActions', () => {
    it('should throw an exception if plugin is not registered', async () => {
      const noop = function () {}
      const handlers = {}
      const actions = [{type: 'dne'}]
      try {
        await handleActions(noop, handlers, {}, actions)
      } catch (e) {
        deepEqual(e.error.message, '"dne" is not a registered plugin.')
        return
      }
      fail('handleActions did not throw')
    })

    it('run a fn for the call action', async () => {
      let fn = function * () {}
      let a = call(fn, {foo: 'bar'})
      let config = {foo: 'baz'}
      let run = (handlers, fn, payload, config) => {
        return Promise.resolve({
          handlers,
          fn,
          payload,
          config
        })
      }

      let results = await handleActions(run, {}, config, [a])
      deepEqual(results.length, 1)
      deepEqual(results[0].payload, {
        handlers: {},
        payload: {foo: 'bar'},
        fn,
        config
      })
    })

    it('should use the call action handler is provided', async () => {
      let fn = function * () {}
      let a = call(fn, {foo: 'bar'})
      let callHandler = stub().returns(true)
      const handlers = {
        call: callHandler
      }

      let results = await handleActions(() => {}, handlers, {}, [a])
      deepEqual(results.length, 1)
      deepEqual(results[0].payload, true)
      deepEqual(callHandler.firstCall.args[0], {
        type: 'call',
        payload: {foo: 'bar'},
        fn
      })
    })

    it('should handle errors from effects-as-data functions that have been called using the call action', async () => {
      const error = new Error('nope')
      const handlers = {}
      const a = call(testCalledFn, {})
      function * testCalledFn () {
        throw error
      }

      let results = await handleActions(run, handlers, {}, [a])
      deepEqual(results[0].success, false)
      deepEqual(results[0].error.message, error.message)
    })

    it('should normalize results to success objects', async () => {
      const a = {
        type: 'test'
      }
      const handlers = {
        test: 'foo'
      }
      const run = () => {}
      let results = await handleActions(run, handlers, {}, [a])
      deepEqual(results[0], {
        success: true,
        payload: 'foo'
      })
    })

    it('should pass action, handlers and config into handler', async () => {
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
      let results = await handleActions(run, handlers, config, [a])
      deepEqual(results[0].payload, expected)
    })

    it('should support handlers as functions returning values', async () => {
      const a = {
        type: 'test'
      }
      const handlers = {
        test: () => 'foo'
      }
      const run = () => {}
      let results = await handleActions(run, handlers, {}, [a])
      deepEqual(results[0].payload, 'foo')
    })

    it('should support handlers returning promises', async () => {
      const a = {
        type: 'test'
      }
      const handlers = {
        test: () => Promise.resolve('foo')
      }
      const run = () => {}
      let results = await handleActions(run, handlers, {}, [a])
      deepEqual(results[0].payload, 'foo')
    })

    it('should support handlers returning values', async () => {
      const a = {
        type: 'test'
      }
      const handlers = {
        test: 'foo'
      }
      const run = () => {}
      let results = await handleActions(run, handlers, {}, [a])
      deepEqual(results[0].payload, 'foo')
    })

    it('should handle promise rejections and normalize to a failure', async () => {
      const a = {
        type: 'test'
      }
      const error = new Error('nope')
      const handlers = {
        test: Promise.reject(error)
      }
      const run = () => {}
      let results = await handleActions(run, handlers, {}, [a])
      deepEqual(results, [{
        success: false,
        error
      }])
    })

    it('should handle thrown errors and normalize to a failure', async () => {
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
      let results = await handleActions(run, handlers, {}, [a])
      deepEqual(results, [{
        success: false,
        error
      }])
    })
  })
})
