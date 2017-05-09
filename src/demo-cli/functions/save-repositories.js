const { actions, isFailure } = require('../../node')
const { pluck } = require('ramda')
const getListOfNames = pluck(['name'])

const saveRepositories = function*(filename) {
  const { payload: username } = yield actions.prompt(
    '\nEnter a github username: '
  )
  const repos = yield actions.httpGet(
    `https://api.github.com/users/${username}/repos`
  )
  if (isFailure(repos)) return repos
  const names = getListOfNames(repos.payload)
  yield actions.logInfo(names.join('\n'))
  return names
}

module.exports = {
  saveRepositories,
}
