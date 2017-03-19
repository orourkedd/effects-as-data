const { now } = require('./now')
const { deepEqual } = require('assert')

describe('now.js', () => {
  describe('#now', () => {
    it('should return a now action', () => {
      const expected = { type: 'now' }
      const actual = now()
      deepEqual(actual, expected)
    })
  })
})
