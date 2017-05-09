const { getState, setState } = require('./state')
const { deepEqual } = require('assert')

describe('state.js', () => {
  describe('getState()', () => {
    it('should return a getState action with a key field', () => {
      const expected = {
        type: 'getState',
        keys: ['foo'],
      }

      const actual = getState(['foo'])

      deepEqual(actual, expected)
    })
  })

  describe('setState()', () => {
    it('should return a setState action with a key and payload field', () => {
      const expected = {
        type: 'setState',
        payload: { foo: 'bar' },
      }

      const actual = setState({ foo: 'bar' })

      deepEqual(actual, expected)
    })
  })
})
