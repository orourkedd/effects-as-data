const { merge } = require('ramda')
const { run } = require('./run')
const all = require('./run')
const handlers = require('./handlers/node')
const actions = require('./actions/node')

const nodeRun = (fn, payload, config) => {
  return run(handlers, fn, payload, config)
}

module.exports = merge(all, {
  run: nodeRun,
  actions
})
