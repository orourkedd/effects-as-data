const { testIt } = require('../../test')
const { saveRepositories } = require('./save-repositories')
const { actions, failure } = require('../../node')

const testSaveRepositories = testIt(saveRepositories)

describe('saveRepositories()', () => {
  it('should get repositories and print names', testSaveRepositories(() => {
    const repos = [
      { name: 'foo' },
      { name: 'bar' }
    ]
    return [
      ['repos.json', actions.prompt('\nEnter a github username: ')],
      ['orourkedd', actions.httpGet('https://api.github.com/users/orourkedd/repos')],
      [repos, actions.logInfo('foo\nbar')],
      [null, ['foo', 'bar']]
    ]
  }))

  it('should return http GET failure', testSaveRepositories(() => {
    const httpError = new Error('http error!')
    return [
      ['repos.json', actions.prompt('\nEnter a github username: ')],
      ['orourkedd', actions.httpGet('https://api.github.com/users/orourkedd/repos')],
      [failure(httpError), failure(httpError)]
    ]
  }))
})
