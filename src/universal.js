const { merge } = require('ramda')
const { run } = require('./run')
const all = require('./run')
const handlers = require('./handlers/universal')
const actions = require('./actions/universal')

const universalRun = (fn, payload, config) => {
  return run(handlers, fn, payload, config)
}

module.exports = merge(all, {
  run: universalRun,
  actions
})
