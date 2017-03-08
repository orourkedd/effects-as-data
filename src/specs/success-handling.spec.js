const { run, success } = require('../index')
const { deepEqual } = require('assert')

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
  return 37
}

const handlers = {
  noop: noopHandler,
  test: testHandler
}

describe('Success Handling', () => {
  describe('onSuccess', () => {
    it('should call onSuccess callback with error payload', () => {
      let result
      const onSuccess = (payload) => {
        result = payload
      }
      return run(handlers, test, 42, {
        name: 'myTestFunction',
        onSuccess
      })
      .then(() => {
        const expected = {
          fn: 'myTestFunction',
          log: [
            [42, {type: 'noop'}],
            [success('noop'), {type: 'test'}]
          ],
          result: success(37),
          action: { type: 'test' }
        }

        deepEqual(result, expected)
      })
    })

    it('should call onSuccess callback for a list of actions', () => {
      let result
      const onSuccess = (payload) => {
        result = payload
      }
      return run(handlers, testList, 42, {
        name: 'myTestFunction',
        onSuccess
      })
      .then(() => {
        const expected = {
          fn: 'myTestFunction',
          log: [
            [42, [{type: 'noop'}, {type: 'test'}]]
          ],
          result: success(37),
          action: { type: 'test' }
        }

        deepEqual(result, expected)
      })
    })
  })
})
