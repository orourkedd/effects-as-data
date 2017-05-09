const { call } = require('./call')
const { deepEqual } = require('assert')

describe('call.js', () => {
  describe('#call', () => {
    it('should return a call action', () => {
      const fn = function*() {}
      const a = call(fn, 'payload')
      deepEqual(a, {
        type: 'call',
        payload: 'payload',
        fn,
        asyncAction: false,
      })
    })

    it('should set options', () => {
      const fn = function*() {}
      const a = call(fn, 'payload', { asyncAction: true })
      deepEqual(a, {
        type: 'call',
        payload: 'payload',
        fn,
        asyncAction: true,
      })
    })
  })
})
