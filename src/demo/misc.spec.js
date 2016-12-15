const { singleLine, normalizeToSuccess } = require('./misc')
const { testIt } = require('../test')
const { httpGet } = require('./actions')
const { success } = require('../util')
const testSingleLine = testIt(singleLine)
const testNormalizeToSuccess = testIt(normalizeToSuccess)

describe('demo/misc.js', () => {
  describe('#singleLine', () => {
    it('handles it', testSingleLine(() => {
      return [
        ['123', httpGet('http://example.com/api/v1/users/123')]
      ]
    }))
  })

  describe('test framework', () => {
    it('should normalize each element in action result arrays to a success object', testNormalizeToSuccess(() => {
      return [
        [undefined, [{type: 'test'}]],
        [[1], [success(1)]]
      ]
    }))
  })
})
