const { requireModule } = require('./require-module')
const { deepEqual } = require('assert')

describe('require-module.js', () => {
  describe('requireModule()', () => {
    it('should return an requireModule action', () => {
      const expected = {
        type: 'requireModule',
        path: '/my/test/module',
      }
      const actual = requireModule('/my/test/module')
      deepEqual(actual, expected)
    })
  })
})
