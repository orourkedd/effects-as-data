const { getUsers, sendEmails, sendEmailsToUsers } = require('./users')
const { testHandlers } = require('../test')
const {
  cacheGet,
  httpGet,
  cacheSet,
  log,
  logError,
  sendEmail
} = require('./actions')
const { success, failure, map, call, merge } = require('../util')

const testGetUsers = testHandlers(getUsers, undefined)
const testSendEmail = testHandlers(sendEmails)
const testSendEmailsToUsers = testHandlers(sendEmailsToUsers, undefined)

const buildHandlers = (values) => {
  return merge({
    cacheGet: null,
    httpGet: null,
    cacheSet: null,
    log: null,
    logError: null
  }, values)
}

describe('demo/users.js with handlers', () => {
  describe('#getUsers', () => {
    describe('if cache hit', () => {
      it('should return value from cache on cache hit and log cache hit', () => {
        const handlers = buildHandlers({
          cacheGet: [{id: 1}]
        })

        const expected = [
          cacheGet('users'),
          log('CACHE_HIT'),
          success([{id: 1}])
        ]

        return testGetUsers(handlers, expected)
      })
    })

    describe('if cache miss', () => {
      describe('if user GET success', () => {
        it('should GET users and set cache', () => {
          const handlers = buildHandlers({
            httpGet: [{id: 1}]
          })

          const expected = [
            cacheGet('users'),
            httpGet('https://api.github.com/users'),
            cacheSet('users', [{id: 1}]),
            success([{id: 1}])
          ]

          return testGetUsers(handlers, expected)
        })

        describe('if cache set failure', () => {
          it('should log error and return result', () => {
            const error = new Error('cache set failure')
            const handlers = buildHandlers({
              httpGet: [{id: 1}],
              cacheSet: failure(error)
            })

            const expected = [
              cacheGet('users'),
              httpGet('https://api.github.com/users'),
              cacheSet('users', [{id: 1}]),
              logError(error),
              success([{id: 1}])
            ]

            return testGetUsers(handlers, expected)
          })
        })
      })

      describe('if user GET failure', () => {
        it('should log error and return failure object', () => {
          const error = new Error('user get error')
          const failureObj = failure(error)
          const handlers = buildHandlers({
            httpGet: failureObj
          })

          const expected = [
            cacheGet('users'),
            httpGet('https://api.github.com/users'),
            logError(error),
            failureObj
          ]

          return testGetUsers(handlers, expected)
        })
      })
    })

    describe('if cache miss error', () => {
      it('should log if error', () => {
        const error = new Error('cache get error')
        const handlers = buildHandlers({
          cacheGet: failure(error),
          httpGet: [{id: 1}]
        })

        const expected = [
          cacheGet('users'),
          logError(error),
          httpGet('https://api.github.com/users'),
          cacheSet('users', [{id: 1}]),
          success([{id: 1}])
        ]

        return testGetUsers(handlers, expected)
      })
    })
  })

  describe('#sendEmails', () => {
    it('should send emails to users', () => {
      const sendEmailHandler = ({user}) => {
        return {
          status: 'sent',
          user
        }
      }

      const handlers = {
        sendEmail: sendEmailHandler
      }

      const users = [{id: 1}, {id: 2}, {id: 3}]
      const emails = map(sendEmail, users)
      const expectedResults = map((user) => {
        return {
          status: 'sent',
          user
        }
      }, users)
      const expected = [
        emails,
        expectedResults
      ]

      return testSendEmail(users, handlers, expected)
    })
  })

  describe('#sendEmailsToUsers', () => {
    it('should send emails to all users', () => {
      const sendEmailResults = [sendEmail({id: 1}), sendEmail({id: 2}), sendEmail({id: 3})]
      const callReturns = [
        sendEmailResults,
        [{id: 1}, {id: 2}, {id: 3}]
      ]
      const callHandler = () => callReturns.pop()
      const handlers = {
        call: callHandler
      }

      const users = [{id: 1}, {id: 2}, {id: 3}]
      const expected = [
        call(getUsers),
        call(sendEmails, users),
        success(sendEmailResults)
      ]

      return testSendEmailsToUsers(handlers, expected)
    })
  })
})
