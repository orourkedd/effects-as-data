const { testIt } = require('../test')
const { success } = require('../util')
const { deepEqual } = require('assert')

const httpGet = url => {
  return {
    type: 'httpGet',
    url,
  }
}

function* singleLine(id) {
  const s1 = yield httpGet(`http://example.com/api/v1/users/${id}`)
  return s1
}

function* normalizeToSuccess() {
  const s1 = yield [{ type: 'test' }]
  return s1
}

function* yieldArray() {
  const s1 = yield [{ type: 'test' }]
  return s1
}

const testSingleLine = testIt(singleLine)
const testNormalizeToSuccess = testIt(normalizeToSuccess)
const testYieldArray = testIt(yieldArray)

describe('misc.spec.js', () => {
  describe('#singleLine', () => {
    it(
      'should not fail',
      testSingleLine(() => {
        //  prettier-ignore
        return [
          ['123', httpGet('http://example.com/api/v1/users/123')],
          [{foo: 'bar'}, success({foo: 'bar'})]
        ]
      })
    )
  })

  describe('test framework', () => {
    it(
      'should normalize each element in action result arrays to a success object',
      testNormalizeToSuccess(() => {
        //  prettier-ignore
        return [
          [undefined, [{type: 'test'}]],
          [[1], [success(1)]]
        ]
      })
    )

    it('should give proper error message if yielding array but no results', () => {
      try {
        testYieldArray(() => {
          //  prettier-ignore
          return [
            [undefined, [{type: 'test'}]]
          ]
        })()
      } catch (e) {
        deepEqual(
          e.message,
          'Your spec does not have as many steps as your function.  Are you missing a return line?'
        )
      }
    })

    it('should give proper error message if spec is returning undefined', () => {
      try {
        testYieldArray(() => {})()
      } catch (e) {
        deepEqual(
          e.message,
          'Your spec must return an array of tuples.  It is currently returning a value of type "undefined".'
        )
      }
    })

    it('should give proper error message if spec is returning an object', () => {
      try {
        testYieldArray(() => {
          return {}
        })()
      } catch (e) {
        deepEqual(
          e.message,
          'Your spec must return an array of tuples.  It is currently returning a value of type "object".'
        )
      }
    })

    it('should give proper error message if spec is returning an string', () => {
      try {
        testYieldArray(() => {
          return 'what?'
        })()
      } catch (e) {
        deepEqual(
          e.message,
          'Your spec must return an array of tuples.  It is currently returning a value of type "string".'
        )
      }
    })
  })
})
