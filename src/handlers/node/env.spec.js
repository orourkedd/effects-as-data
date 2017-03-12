const { env } = require('./env')
const { deepEqual } = require('assert')

describe('env.js', () => {
  describe('env()', () => {
    it('should process.env', () => {
      const expected = process.env
      const actual = env()
      deepEqual(actual, expected)
    })
  })
})
