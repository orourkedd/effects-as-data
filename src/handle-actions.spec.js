const { handleActions } = require('./handle-actions')
const { deepEqual } = require('assert')

describe('handle-actions.js', () => {
  describe('handleActions', () => {
    it('should throw an exception is plugin is not registered', async () => {
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
  })
})
