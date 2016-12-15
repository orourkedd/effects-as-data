const { run, failure, success } = require('../index')
const { deepEqual } = require('assert')

const error = new Error('oops!')

function * test () {
  yield { type: 'noop' }
  yield { type: 'test' }
}

function noopHandler () {
  return 'noop'
}

function testHandler (action) {
  return failure(error)
}

const handlers = {
  noop: noopHandler,
  test: testHandler
}

describe('Error Handling', () => {
  describe('onFailure', () => {
    it('should call onFailure callback with error payload', () => {
      let errorResult
      const onFailure = (payload) => {
        errorResult = payload
      }
      return run(handlers, test, 42, {
        name: 'myTestFunction',
        onFailure
      })
      .then(() => {
        const expected = {
          fn: 'myTestFunction',
          log: [
            [42, {type: 'noop'}],
            [success('noop'), {type: 'test'}]
          ],
          errorMessage: error.message,
          errorName: error.name,
          errorStack: error.stack,
          error
        }

        deepEqual(errorResult, expected)
      })
    })
  })
})
