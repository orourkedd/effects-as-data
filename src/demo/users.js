const {
  cacheGet,
  cacheSet,
  httpGet,
  log,
  logError,
  sendEmail
} = require('./actions')
const {
  isFailure,
  map,
  prop
} = require('../util')
const { call } = require('../actions')

function * getUsers () {
  let cachedUsers = yield cacheGet('users')
  if (isFailure(cachedUsers)) yield logError(cachedUsers.error)
  if (cachedUsers.payload) {
    yield log('CACHE_HIT')
    return cachedUsers
  }
  let users = yield httpGet('https://api.github.com/users')
  if (isFailure(users)) {
    yield logError(users.error)
    return users
  }
  let cacheSetResult = yield cacheSet('users', users.payload)
  if (isFailure(cacheSetResult)) yield logError(cacheSetResult.error)
  return users
}

function * sendEmails (users) {
  let emails = map(sendEmail, users)
  let result = yield emails
  const propPayload = prop('payload')
  return map(propPayload, result)
}

function * sendEmailsToUsers () {
  let users = yield call(getUsers)
  if (isFailure(users)) return users
  let sendResults = yield call(sendEmails, users.payload)
  return sendResults
}

module.exports = {
  getUsers,
  sendEmails,
  sendEmailsToUsers
}
