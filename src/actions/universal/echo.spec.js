const { echo } = require('./echo')
const { deepEqual } = require('assert')

describe('echo.js', () => {
  describe('echo()', () => {
    it('should return an echo action with a payload field', () => {
      const expected = {
        type: 'echo',
        payload: '123',
      }

      const actual = echo(123)

      deepEqual(actual, expected)
    })
  })
})
