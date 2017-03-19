const { prompt, httpGet, logInfo } = require('../../node').actions
const { isFailure } = require('../../util')
const { pluck } = require('ramda')
const getListOfNames = pluck(['name'])

const saveRepositories = function * (filename) {
  const {payload: username} = yield prompt('\nEnter a github username: ')
  const repos = yield httpGet(`https://api.github.com/users/${username}/repos`)
  if (isFailure(repos)) return repos
  const names = getListOfNames(repos.payload)
  yield logInfo(names.join('\n'))
  return names
}

module.exports = {
  saveRepositories
}
