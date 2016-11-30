require('babel-polyfill')
const { run } = require('../index')
const { readFileSync } = require('fs')
const fetch = require('isomorphic-fetch')
const fs = require('fs')
const { testIt } = require('../test')
const { success, failure, isFailure } = require('../util')

//  Action Creators

const httpGet = (url) => {
  return {
    type: 'httpGet',
    url
  }
}

const writeFile = (path, data) => {
  return {
    type: 'writeFile',
    path,
    data
  }
}

//  Action Handlers

const httpGetActionHandler = (action) => {
  return fetch(action.url)
    .then((response) => response.json())
}

const writeFileActionHandler = (action) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(action.path, action.data, {encoding: 'utf8'}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

//  Pure Functions for Business Logic

const saveRepositories = function * () {
  const repos = yield httpGet('https://api.github.com/repositories?page=1')
  if (isFailure(repos)) return repos
  const result = yield writeFile('repos.json', JSON.stringify(repos.payload))
  return result
}

//  Test It

testIt(saveRepositories, () => {
  const repos = [{id: 1}]
  return [
    [undefined, httpGet('https://api.github.com/repositories?page=1')],
    [repos, writeFile('repos.json', JSON.stringify(repos))],
    [undefined, success()]
  ]
})()

testIt(saveRepositories, () => {
  const error = new Error('some http error')
  return [
    [undefined, httpGet('https://api.github.com/repositories?page=1')],
    [failure(error), failure(error)]
  ]
})()

//  Wire It Up and Run It

const handlers = {
  httpGet: httpGetActionHandler,
  writeFile: writeFileActionHandler
}

run(handlers, saveRepositories).then(() => {
  console.log('Repos Written To Disk')
  const contents = readFileSync('repos.json', {encoding: 'utf8'})
  const json = JSON.parse(contents)
  console.log(json)
})
