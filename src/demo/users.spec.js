const {
  getUsers,
  sendEmails,
  sendEmailsToUsers
} = require('./users')
const { testIt } = require('../test')
const {
  cacheGet,
  httpGet,
  cacheSet,
  log,
  logError,
  sendEmail
} = require('./actions')
const {
  success,
  failure,
  map,
  prop
} = require('../util')
const { call } = require('../actions')

const testSendEmail = testIt(sendEmails)
const testSendEmailsToUsers = testIt(sendEmailsToUsers)
const testGetUsers = testIt(getUsers)

describe('demo/users.js', () => {
  describe('#getUsers', () => {
    describe('if cache hit', () => {
      it.only('should return value from cache on cache hit and log cache hit', testGetUsers(() => {
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
              [failure(error), logError(error)],
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
            [failure(error), logError(error)],
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
          [failure(error), logError(error)],
          [null, httpGet('https://api.github.com/users')],
          [[{id: 1}], cacheSet('users', [{id: 1}])],
          [null, success([{id: 1}])]
        ]
      }))
    })
  })

  describe('#sendEmails', () => {
    it('should send emails to users', testSendEmail(() => {
      const users = [{id: 1}, {id: 2}, {id: 3}]
      const emails = map(sendEmail, users)
      const sendEmailResults1 = map((user) => ({status: 'sent', user}), users)
      const sendEmailResults2 = map(success, sendEmailResults1)

      const propPayload = prop('payload')
      const expectedReturn = map(propPayload, sendEmailResults2)

      return [
        [users, emails],
        [sendEmailResults2, expectedReturn]
      ]
    }))
  })

  describe('#sendEmailsToUsers', () => {
    it('should send emails to all users', testSendEmailsToUsers(() => {
      const sendEmailResults = [sendEmail({id: 1}), sendEmail({id: 2}), sendEmail({id: 3})]
      const users = [{id: 1}, {id: 2}, {id: 3}]

      return [
        [null, call(getUsers)],
        [users, call(sendEmails, users)],
        [sendEmailResults, success(sendEmailResults)]
      ]
    }))
  })
})
