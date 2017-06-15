const actions = require('../actions/node')
const { run } = require('../index')
const { success } = require('../index')
const { deepEqual } = require('assert')
const { delay } = require('./test-util')
const { asyncify } = require('../util')

describe('Async actions', () => {
  it('should handle actions asynchronously', () => {
    let called = false
    function delayHandler2() {
      return delay(100).then(() => {
        called = true
      })
    }

    function* test() {
      const a = delayAction()
      a.asyncAction = true
      yield a
      return 'returnvalue'
    }
    const handlers = {
      delay: delayHandler2
    }
    return run(handlers, test).then(r => {
      deepEqual(r, 'returnvalue')
      deepEqual(called, false)
      return delay().then(() => {
        deepEqual(called, true)
      })
    })
  })

  it('should handle actions asynchronously when non promise value is returned', () => {
    let called = false
    function numberHandler() {
      return Promise.resolve().then(() => delay(25)).then(() => {
        called = true
        return 32
      })
    }

    function* test() {
      yield asyncify({ type: 'number' })
      return 'returnvalue'
    }
    const handlers = {
      number: numberHandler
    }
    return run(handlers, test).then(r => {
      deepEqual(r, 'returnvalue')
      deepEqual(called, false)
      return delay(50).then(() => {
        deepEqual(called, true)
      })
    })
  })

  it('should handle actions synchronously', () => {
    let called = false
    function delayHandler2() {
      return delay(100).then(() => {
        called = true
      })
    }

    function* test() {
      yield delayAction()
      return 'returnvalue'
    }
    const handlers = {
      delay: delayHandler2
    }
    return run(handlers, test).then(r => {
      deepEqual(r, 'returnvalue')
      deepEqual(called, true)
    })
  })
})

function delayHandler() {
  return new Promise(resolve => setTimeout(resolve, 100))
}

function delayAction() {
  return {
    type: 'delay'
  }
}
