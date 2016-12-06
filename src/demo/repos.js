require('babel-polyfill')
const { run } = require('../index')
const fs = require('fs')
const path = require('path')
const { testIt } = require('../test')
const { success, failure, isFailure, pick, map } = require('../util')
const readline = require('readline')
const { get } = require('simple-protocol-http')

//  Action Creators

const httpGet = (url) => {
  return {
    type: 'httpGet',
    url
  }
}

const log = (message) => {
  return {
    type: 'log',
    message
  }
}

const writeFile = (path, data) => {
  return {
    type: 'writeFile',
    path,
    data
  }
}

const userInput = (question) => {
  return {
    type: 'userInput',
    question
  }
}

//  Action Handlers

const httpGetActionHandler = (action) => {
  return get(action.url)
}

const writeFileActionHandler = (action) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(action.path, action.data, {encoding: 'utf8'}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          realpath: path.resolve(action.path),
          path: action.path
        })
      }
    })
  })
}

const logHandler = (action) => {
  console.log(action.message)
}

const userInputHandler = (action) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(action.question, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}

//  Pure Functions for Business Logic

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

const printRepository = (list, username) => {
  return [
    log(`\nRepositories for ${username}`),
    log(`=============================================`),
    log(list)
  ]
}

const buildList = (repos) => {
  const l1 = map(pick(['name', 'git_url']), repos)
  const l2 = map(({name, git_url}) => `${name}: ${git_url}`, l1) // eslint-disable-line
  const l3 = l2.join('\n')
  return l3
}

//  Test It
//  Happy path
testIt(saveRepositories, () => {
  const repos = [{name: 'test', git_url: 'git://...'}]
  const reposListFormatted = 'test: git://...'
  const writeFileResult = success({path: 'repos.json', realpath: 'r/repos.json'})
  return [
    ['repos.json', userInput('\nEnter a github username: ')],
    ['orourkedd', httpGet('https://api.github.com/users/orourkedd/repos')],
    [repos, printRepository(reposListFormatted, 'orourkedd')],
    [[], writeFile('repos.json', JSON.stringify(repos))],
    [writeFileResult, log('\nRepos Written From Github To File: r/repos.json')],
    [undefined, writeFileResult]
  ]
})()

// Http Error Handling
testIt(saveRepositories, () => {
  const httpError = new Error('http error!')
  return [
    ['repos.json', userInput('\nEnter a github username: ')],
    ['orourkedd', httpGet('https://api.github.com/users/orourkedd/repos')],
    [failure(httpError), failure(httpError)]
  ]
})()

//  File Write Error Handling
testIt(saveRepositories, () => {
  const repos = [{name: 'test', git_url: 'git://...'}]
  const reposListFormatted = 'test: git://...'
  const writeError = new Error('write error!')
  //  3 log actions return 3 success results
  const printResult = [success(), success(), success()]
  return [
    ['repos.json', userInput('\nEnter a github username: ')],
    ['orourkedd', httpGet('https://api.github.com/users/orourkedd/repos')],
    [repos, printRepository(reposListFormatted, 'orourkedd')],
    [printResult, writeFile('repos.json', JSON.stringify(repos))],
    [failure(writeError), failure(writeError)]
  ]
})()

//  Wire It Up and Run It

const handlers = {
  httpGet: httpGetActionHandler,
  writeFile: writeFileActionHandler,
  log: logHandler,
  userInput: userInputHandler
}

run(handlers, saveRepositories, 'repos.json').catch(console.error)
