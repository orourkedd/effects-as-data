const { saveRepositories } = require('./save-repositories')
const { actions, success, failure } = require('../../node')
const { deepEqual } = require('assert')

describe('saveRepositories()', () => {
  it('should get repositories and print names', () => {
    const i = saveRepositories('repos.json')
    const s1 = i.next('repos.json')
    deepEqual(s1.value, actions.prompt('\nEnter a github username: '))

    const s2 = i.next(success('orourkedd'))
    deepEqual(s2.value, actions.httpGet('https://api.github.com/users/orourkedd/repos'))

    const repos = [
      { name: 'foo' },
      { name: 'bar' }
    ]
    const s3 = i.next(success(repos))
    deepEqual(s3.value, actions.logInfo('foo\nbar'))

    const s4 = i.next(success())
    deepEqual(s4.value, ['foo', 'bar'])

    //  assert that generator is complete
    deepEqual(s4.done, true)
  })

  it('should return http GET failure', () => {
    const i = saveRepositories('repos.json')
    const s1 = i.next('repos.json')
    deepEqual(s1.value, actions.prompt('\nEnter a github username: '))

    const s2 = i.next(success('orourkedd'))
    deepEqual(s2.value, actions.httpGet('https://api.github.com/users/orourkedd/repos'))

    const httpError = new Error('http error!')
    const s3 = i.next(failure(httpError))
    deepEqual(s3.value, failure(httpError))

    //  assert that generator is complete
    deepEqual(s3.done, true)
  })
})
