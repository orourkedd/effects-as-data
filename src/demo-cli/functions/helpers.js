const { log } = require('../actions')
const { map, pick } = require('ramda')

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

module.exports = {
  printRepository,
  buildList
}
