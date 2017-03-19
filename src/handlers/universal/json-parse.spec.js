const { jsonParse } = require('./json-parse')
const actions = require('../../actions/universal')
const { deepEqual } = require('assert')

describe('json-parse.js', () => {
  describe('jsonParse()', () => {
    it('should parsed json', () => {
      const action = actions.jsonParse('{"id":123}')
      const expected = { id: 123 }
      const actual = jsonParse(action)
      deepEqual(actual, expected)
    })
  })
})
