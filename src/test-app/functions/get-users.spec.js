const { getUsers } = require('./index')
const { testIt } = require('../../test')
const {
  cacheGet,
  httpGet,
  cacheSet,
  log,
  logError
} = require('../actions')
const {
  success,
  failure,
  errorToObject
} = require('../../util')

const testGetUsers = testIt(getUsers)

describe('demo/users.js', () => {
  describe('#getUsers', () => {
    describe('if cache hit', () => {
      it('should return value from cache on cache hit and log cache hit', testGetUsers(() => {
        return [
          [null, cacheGet('users')],
          [[{id: 1}], log('CACHE_HIT')],
          [null, success([{id: 1}])]
        ]
      }))
    })

    describe('if cache miss', () => {
      describe('if user GET success', () => {
        it('should GET users and set cache', testGetUsers(() => {
          return [
            [null, cacheGet('users')],
            [null, httpGet('https://api.github.com/users')],
            [[{id: 1}], cacheSet('users', [{id: 1}])],
            [null, success([{id: 1}])]
          ]
        }))

        describe('if cache set failure', () => {
          it('should log error and return result', testGetUsers(() => {
            const error = new Error('cache set failure')

            return [
              [null, cacheGet('users')],
              [null, httpGet('https://api.github.com/users')],
              [[{id: 1}], cacheSet('users', [{id: 1}])],
              [failure(error), logError(errorToObject(error))],
              [null, success([{id: 1}])]
            ]
          }))
        })
      })

      describe('if user GET failure', () => {
        it('should log error and return failure object', testGetUsers(() => {
          const error = new Error('user get error')

          return [
            [null, cacheGet('users')],
            [null, httpGet('https://api.github.com/users')],
            [failure(error), logError(errorToObject(error))],
            [null, failure(error)]
          ]
        }))
      })
    })

    describe('if cache miss error', () => {
      it('should log if error', testGetUsers(() => {
        const error = new Error('cache get error')

        return [
          [null, cacheGet('users')],
          [failure(error), logError(errorToObject(error))],
          [null, httpGet('https://api.github.com/users')],
          [[{id: 1}], cacheSet('users', [{id: 1}])],
          [null, success([{id: 1}])]
        ]
      }))
    })
  })
})
