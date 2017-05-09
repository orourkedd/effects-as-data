const { getState, setState, getGlobalState } = require('./state')
const actions = require('../../actions/universal')
const { deepEqual } = require('assert')

describe('state.js', () => {
  describe('getState()', () => {
    it('should return values from state represented by keys', () => {
      const action = actions.getState(['foo', 'bar'])
      global.effectsAsDataState = {
        foo: 1,
        bar: 2,
      }
      const expected = {
        foo: 1,
        bar: 2,
      }
      const actual = getState(action)
      deepEqual(actual, expected)
    })
  })

  describe('setState()', () => {
    it('should return values from state represented by keys', () => {
      const foo = Date.now()
      const bar = Date.now()
      const action = actions.setState({ foo, bar })
      setState(action)
      const expected = { foo, bar }
      const actual = getGlobalState()
      deepEqual(actual, expected)
    })
  })
})
