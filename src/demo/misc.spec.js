const { singleLine } = require('./misc')
const { testIt } = require('../test')
const { httpGet } = require('./actions')

const testSingleLine = testIt(singleLine)

describe('demo/misc.js', () => {
  describe('#singleLine', () => {
    it('handles it', testSingleLine(() => {
      return [
        ['123', httpGet('http://example.com/api/v1/users/123')]
      ]
    }))
  })
})
