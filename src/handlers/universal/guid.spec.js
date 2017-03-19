const actions = require('../../actions/universal/guid')
const { guidFn } = require('./guid')
const { deepEqual } = require('assert')

describe('guid.js', () => {
  describe('#guid', () => {
    it('should return a guid', () => {
      const action = actions.guid()
      const uuidV4 = () => '70776e6f-8476-4304-bfd2-3bc2e4bdd996'
      const actual = guidFn(uuidV4, action)
      const expected = '70776e6f-8476-4304-bfd2-3bc2e4bdd996'
      deepEqual(actual, expected)
    })
  })
})
