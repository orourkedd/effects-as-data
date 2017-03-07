const {
  cacheGet,
  cacheSet,
  httpGet,
  log,
  logError
} = require('../actions')
const { isFailure } = require('../../util')

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

module.exports = {
  getUsers
}
