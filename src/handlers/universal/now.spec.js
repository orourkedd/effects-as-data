const actions = require('../../actions/universal/now')
const { nowFn } = require('./now')
const { deepEqual } = require('assert')

describe('now.js', () => {
  describe('#now', () => {
    it('should return a now', () => {
      const action = actions.now()
      const dateNow = () => 123
      const actual = nowFn(dateNow, action)
      const expected = 123
      deepEqual(actual, expected)
    })
  })
})
