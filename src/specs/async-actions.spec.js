const actions = require('../actions/node')
const { run } = require('../index')
const { success } = require('../index')
const { deepEqual } = require('assert')

describe('Async actions', () => {
  describe('call actions', () => {
    it('should handle call actions asynchronously', () => {
      let called = false
      function* callMe() {
        yield delayAction()
        called = true
        return 'returnvalue'
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
        return 'returnvalue'
      }
      function* test() {
        return yield actions.call(callMe)
      }
      const handlers = {
        delay: delayHandler
      }
      return run(handlers, test).then(r => {
        deepEqual(r, success('returnvalue'))
        deepEqual(called, true)
      })
    })
  })

  describe('actions', () => {
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
})

function delayHandler() {
  return new Promise(resolve => setTimeout(resolve, 100))
}

function delayAction() {
  return {
    type: 'delay'
  }
}

function delay(time = 200) {
  return new Promise(resolve => setTimeout(resolve, time))
}
