const { simplePlugin } = require('../../effects-as-data')

function test1Plugin (payload) {
  return Promise.resolve('test1-result')
}

function test1 (contextKey) {
  return {
    type: 'test1',
    contextKey,
    payload: {}
  }
}

module.exports = {
  test1Plugin: simplePlugin(test1Plugin),
  test1
}
