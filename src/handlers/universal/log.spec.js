const { logInfoFn, logErrorFn } = require('./log')
const actions = require('../../actions/universal')
const { deepEqual } = require('assert')

describe('log.js', () => {
  describe('logInfo()', () => {
    it('should console.info() the payload', () => {
      const action = actions.logInfo(123)
      let payload = null
      const consoleLogInfo = p => {
        payload = p
      }
      const expected = 123
      logInfoFn(consoleLogInfo, action)
      const actual = payload
      deepEqual(actual, expected)
    })
  })

  describe('logError()', () => {
    it('should console.error the payload', () => {
      const action = actions.logError(123)
      let payload = null
      const consoleLogError = p => {
        payload = p
      }
      const expected = 123
      logErrorFn(consoleLogError, action)
      const actual = payload
      deepEqual(actual, expected)
    })
  })
})
