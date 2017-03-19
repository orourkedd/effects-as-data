const { echo } = require('./echo')
const actions = require('../../actions/universal')
const { deepEqual } = require('assert')

describe('echo.js', () => {
  describe('echo()', () => {
    it('should return action.payload', () => {
      const action = actions.echo(123)
      const expected = 123
      const actual = echo(action)
      deepEqual(actual, expected)
    })
  })
})
