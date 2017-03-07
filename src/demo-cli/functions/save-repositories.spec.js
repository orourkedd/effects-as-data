const { testIt } = require('../../test')
const { saveRepositories } = require('./save-repositories')
const { userInput, httpGet, writeFile, log } = require('../actions')
const { printRepository } = require('./helpers')
const { success, failure } = require('../../util')

const testSaveRepositories = testIt(saveRepositories)

describe('saveRepositories()', () => {
  it('should get repositories and save to disk', testSaveRepositories(() => {
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
  }))

  it('should return http GET failure', testSaveRepositories(() => {
    const httpError = new Error('http error!')
    return [
      ['repos.json', userInput('\nEnter a github username: ')],
      ['orourkedd', httpGet('https://api.github.com/users/orourkedd/repos')],
      [failure(httpError), failure(httpError)]
    ]
  }))

  it('should return write file error', testSaveRepositories(() => {
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
  }))
})
