const { env } = require('./env')
const { deepEqual } = require('assert')

describe('env.js', () => {
  describe('env()', () => {
    it('should return an env action', () => {
      const expected = { type: 'env' }
      const actual = env()
      deepEqual(actual, expected)
    })
  })
})
