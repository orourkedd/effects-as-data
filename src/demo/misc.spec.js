const { singleLine, normalizeToSuccess, yieldArray } = require('./misc')
const { testIt } = require('../test')
const { httpGet } = require('./actions')
const { success } = require('../util')
const testSingleLine = testIt(singleLine)
const testNormalizeToSuccess = testIt(normalizeToSuccess)
const testYieldArray = testIt(yieldArray)
const { deepEqual } = require('assert')

describe('demo/misc.js', () => {
  describe('#singleLine', () => {
    it('should not fail', testSingleLine(() => {
      return [
        ['123', httpGet('http://example.com/api/v1/users/123')],
        [{foo: 'bar'}, success({foo: 'bar'})]
      ]
    }))
  })

  describe('test framework', () => {
    it('should normalize each element in action result arrays to a success object', testNormalizeToSuccess(() => {
      return [
        [undefined, [{type: 'test'}]],
        [[1], [success(1)]]
      ]
    }))

    it('should give proper error message if yielding array but no results', () => {
      try {
        testYieldArray(() => {
          return [
            [undefined, [{type: 'test'}]]
          ]
        })()
      } catch (e) {
        deepEqual(e.message, 'Your spec does not have as many steps as your function.  Are you missing a return line?')
      }
    })

    it('should give proper error message if spec is returning undefined', () => {
      try {
        testYieldArray(() => {
          return
        })()
      } catch (e) {
        deepEqual(e.message, 'Your spec must return an array of tuples.  It is currently returning a value of type "undefined".')
      }
    })

    it('should give proper error message if spec is returning an object', () => {
      try {
        testYieldArray(() => {
          return {}
        })()
      } catch (e) {
        deepEqual(e.message, 'Your spec must return an array of tuples.  It is currently returning a value of type "object".')
      }
    })

    it('should give proper error message if spec is returning an string', () => {
      try {
        testYieldArray(() => {
          return 'what?'
        })()
      } catch (e) {
        deepEqual(e.message, 'Your spec must return an array of tuples.  It is currently returning a value of type "string".')
      }
    })
  })
})
