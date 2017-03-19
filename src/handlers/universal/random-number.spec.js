const actions = require('../../actions/universal/random-number')
const { randomNumberFn } = require('./random-number')
const { deepEqual } = require('assert')

describe('random-number.js', () => {
  describe('#randomNumber', () => {
    it('should return a randomNumber', () => {
      const action = actions.randomNumber()
      const mathRandom = () => 0.123
      const actual = randomNumberFn(mathRandom, action)
      const expected = 0.123
      deepEqual(actual, expected)
    })
  })
})
