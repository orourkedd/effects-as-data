const { guid } = require('./guid')
const { deepEqual } = require('assert')

describe('guid.js', () => {
  describe('#guid', () => {
    it('should return a guid action', () => {
      const expected = { type: 'guid' }
      const actual = guid()
      deepEqual(actual, expected)
    })
  })
})
