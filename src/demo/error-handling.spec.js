const { run, success, failure } = require('../index')
const { deepEqual } = require('assert')

const error = new Error('oops!')

function * test () {
  yield { type: 'noop' }
  yield { type: 'test' }
}

function * testList () {
  yield [{ type: 'noop' }, { type: 'test' }]
}

function noopHandler () {
  return 'noop'
}

function testHandler (action) {
  throw error
}

const handlers = {
  noop: noopHandler,
  test: testHandler
}

describe.only('Error Handling', () => {
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
          failure: failure(error),
          action: { type: 'test' }
        }

        deepEqual(errorResult, expected)
      })
    })

    it('should call onFailure callback for a list of actions', () => {
      let errorResult
      const onFailure = (payload) => {
        errorResult = payload
      }
      return run(handlers, testList, 42, {
        name: 'myTestFunction',
        onFailure
      })
      .then(() => {
        const expected = {
          fn: 'myTestFunction',
          log: [
            [42, [{type: 'noop'}, {type: 'test'}]]
          ],
          failure: failure(error),
          action: { type: 'test' }
        }

        deepEqual(errorResult, expected)
      })
    })
  })
})
