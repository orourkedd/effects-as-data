const { call } = require('./actions')
const { deepEqual } = require('assert')

describe('actions.js', () => {
  describe('#call', () => {
    it('should return a call action', () => {
      const fn = function * () {}
      const a = call(fn, 'payload')
      deepEqual(a, {
        type: 'call',
        payload: 'payload',
        fn
      })
    })
  })
})
