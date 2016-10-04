const { runAction, emptyState } = require('./purefn')
const { stub } = require('sinon')
const assert = require('chai').assert
const deep = assert.deepEqual

describe('purefn', () => {
  describe('runAction', () => {
    it('should pass action payloads to plugins and set result on context', () => {
      let { action, plugins } = setup('test-result')
      return runAction(plugins, action).then((result) => {
        assert(plugins.test.calledWith(action.payload), 'plugin was not called with action payload')
        deep(result, 'test-result')
      })
    })
  })

  describe('emptyState', () => {
    it('return an empty state object', () => {
      deep(emptyState(), {
        context: {},
        payload: {},
        errors: {}
      })
    })
  })
})

function setup (testPluginResult) {
  let action = testAction()
  let plugins = {
    test: stub().returns(Promise.resolve(testPluginResult))
  }

  let state = emptyState()

  return { action, state, plugins }
}

function testAction () {
  return {
    type: 'test',
    contextKey: 'testResult',
    payload: {
      foo: 'bar'
    }
  }
}
