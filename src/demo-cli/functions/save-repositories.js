const { userInput, httpGet, writeFile, log } = require('../actions')
const { isFailure } = require('../../util')
const { buildList, printRepository } = require('./helpers')

//  Note: effects-as-data will normalize all return values from actions to
//  simple protocol (https://github.com/orourkedd/simple-protocol).  effects-as-data
//  will never intentionally throw an error and will catch all errors and convert
//  them to effects-as-data failures.

const saveRepositories = function * (filename) {
  //  Get the user's Github username from the command line.
  const {payload: username} = yield userInput('\nEnter a github username: ')

  //  Get the users repositories based on the username
  const repos = yield httpGet(`https://api.github.com/users/${username}/repos`)
  if (isFailure(repos)) return repos

  //  Format the list and print it to the console
  const list = buildList(repos.payload)
  yield printRepository(list, username)

  //  Write the repositories as JSON to disk
  const writeResult = yield writeFile(filename, JSON.stringify(repos.payload))
  if (isFailure(writeResult)) return writeResult

  //  Log a message out the user indicating the location of the file
  yield log(`\nRepos Written From Github To File: ${writeResult.payload.realpath}`)

  return writeResult
}

module.exports = {
  saveRepositories
}
