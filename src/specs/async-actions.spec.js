const actions = require('../actions/node')
const { run, success } = require('effects-as-data')
const { deepEqual } = require('assert')

function delayHandler() {
  return new Promise(resolve => setTimeout(resolve, 100))
}

function delayAction() {
  return {
    type: 'delay'
  }
}

function delay() {
  return new Promise(resolve => setTimeout(resolve, 200))
}

describe('Async actions', () => {
  it('should handle call actions asynchronously', () => {
    let called = false
    function* callMe() {
      yield delayAction()
      called = true
      return 'foo'
    }
    function* test() {
      return yield actions.call(callMe, null, { asyncAction: true })
    }
    const handlers = {
      delay: delayHandler
    }
    return run(handlers, test).then(r => {
      deepEqual(r, success())
      deepEqual(called, false)
      return delay().then(() => {
        deepEqual(called, true)
      })
    })
  })

  it('should handle call actions synchronously', () => {
    let called = false
    function* callMe() {
      yield delayAction()
      called = true
      return 'foo'
    }
    function* test() {
      return yield actions.call(callMe)
    }
    const handlers = {
      delay: delayHandler
    }
    return run(handlers, test).then(r => {
      deepEqual(r, success('foo'))
      deepEqual(called, true)
    })
  })
})
