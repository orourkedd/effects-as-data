const { call, buildFunctions } = require('..')
const fetch = require('isomorphic-fetch')

function httpGetCommand(url) {
  return {
    type: 'httpGet',
    url
  }
}

function httpGetHandler(cmd) {
  return fetch(cmd.url).then(r => r.json())
}

function* getPeople() {
  const { results } = yield httpGetCommand('https://swapi.co/api/people')
  const names = results.map(p => p.name)
  return names
}

const config = {
  onCommandComplete: telemetry => {
    console.log('Telemetry (from onCommandComplete):', telemetry)
  }
}

const functions = buildFunctions(
  config,
  { httpGet: httpGetHandler },
  { getPeople }
)

functions
  .getPeople()
  .then(names => {
    console.log('\n')
    console.log('Function Results:')
    console.log(names.join(', '))
  })
  .catch(console.error)
