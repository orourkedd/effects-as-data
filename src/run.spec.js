const { buildFunctions } = require('./run')
const { deepEqual } = require('assert')

describe('run.js', () => {
  describe('buildFunctions()', () => {
    it('should wrap handlers and effects-as-data functions into promise-returning functions', () => {
      function testHandler() {
        return 'foo'
      }

      const testAction = {
        type: 'testHandler',
      }

      function* test1() {
        return yield testAction
      }

      function* test2() {
        return yield testAction
      }

      const functions = buildFunctions({ testHandler }, { test1, test2 })

      return Promise.resolve()
        .then(functions.test1)
        .then(res => {
          deepEqual(res.payload, 'foo')
        })
        .then(functions.test2)
        .then(res => {
          deepEqual(res.payload, 'foo')
        })
    })
  })
})
