const { jsonParse } = require('./json-parse')
const { deepEqual } = require('assert')

describe('json-parse.js', () => {
  describe('jsonParse()', () => {
    it('should return an jsonParse action with a payload field', () => {
      const expected = {
        type: 'jsonParse',
        payload: '{"id":123}',
      }

      const actual = jsonParse('{"id":123}')

      deepEqual(actual, expected)
    })
  })
})
