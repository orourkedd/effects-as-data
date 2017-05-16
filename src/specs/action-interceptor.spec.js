const { run, isSuccess, success, failure } = require('../index')
const { deepEqual } = require('assert')
const { merge, prop } = require('../util')

function returnAction(action) {
  return action
}

describe('Action interceptors', () => {
  it('should intercept action', () => {
    const action = { type: 'returnAction' }
    function* test() {
      return yield action
    }
    const config = {
      actionInterceptor: action => {
        return merge(action, { called: true })
      },
    }
    const handlers = { returnAction }
    return run(handlers, test, null, config)
      .then(prop('payload'))
      .then(modifiedAction => {
        deepEqual(modifiedAction.called, true)
        deepEqual(action.called, undefined)
      })
  })
})
