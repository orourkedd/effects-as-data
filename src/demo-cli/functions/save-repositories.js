const { userInput, httpGet, writeFile, log } = require('../actions')
const { isFailure } = require('../../util')
const { buildList, printRepository } = require('./helpers')

const saveRepositories = function * (filename) {
  const {payload: username} = yield userInput('\nEnter a github username: ')
  const repos = yield httpGet(`https://api.github.com/users/${username}/repos`)
  if (isFailure(repos)) return repos
  const list = buildList(repos.payload)
  yield printRepository(list, username)
  const writeResult = yield writeFile(filename, JSON.stringify(repos.payload))
  if (isFailure(writeResult)) return writeResult
  yield log(`\nRepos Written From Github To File: ${writeResult.payload.realpath}`)
  return writeResult
}

module.exports = {
  saveRepositories
}
