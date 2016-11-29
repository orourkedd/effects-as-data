const { handleActions } = require('./handle-actions')
const { deepEqual } = require('assert')
const { call } = require('./actions')
const { stub } = require('sinon')

describe('handle-actions.js', () => {
  describe('handleActions', () => {
    it('should throw an exception if plugin is not registered', async () => {
      const noop = function () {}
      const handlers = {}
      const actions = [{type: 'dne'}]
      try {
        await handleActions(noop, handlers, actions)
      } catch (e) {
        deepEqual(e.error.message, '"dne" is not a registered plugin.')
        return
      }
      fail('handleActions did not throw')
    })

    it('run a fn for the call action', async () => {
      let fn = function * () {}
      let a = call(fn, {foo: 'bar'})
      let run = (handlers, fn, payload) => {
        return {
          handlers,
          fn,
          payload
        }
      }

      let results = await handleActions(run, {}, [a])
      deepEqual(results.length, 1)
      deepEqual(results[0].payload, {
        handlers: {},
        payload: {foo: 'bar'},
        fn
      })
    })

    it('should use the call action handler is provided', async () => {
      let fn = function * () {}
      let a = call(fn, {foo: 'bar'})
      let callHandler = stub().returns(true)
      const handlers = {
        call: callHandler
      }

      let results = await handleActions(() => {}, handlers, [a])
      deepEqual(results.length, 1)
      deepEqual(results[0].payload, true)
      deepEqual(callHandler.firstCall.args[0], {
        type: 'call',
        payload: {foo: 'bar'},
        fn
      })
    })
  })
})
