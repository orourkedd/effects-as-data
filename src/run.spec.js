const { deepEqual } = require('assert')
const { newExecutionContext, cleanLog } = require('./run')
const { success } = require('./util')

describe('run.js', () => {
  describe('#newExecutionContext', async () => {
    it('should return a new execution context', () => {
      const expected = {log: []}
      const actual = newExecutionContext()
      deepEqual(actual, expected)
    })
  })

  describe('#cleanLog', async () => {
    it('should return a cleaned log', () => {
      const expected = [
        {actions: [{type: 'a'}], results: [success('a')]},
        {actions: [{type: 'b'}], results: [success('b')]}
      ]

      const log = [
        {actions: [{type: 'a'}], results: [success('a')], isArray: false},
        {actions: [{type: 'b'}], results: [success('b')], isArray: false}
      ]

      const actual = cleanLog(log)
      deepEqual(actual, expected)
    })
  })
})
