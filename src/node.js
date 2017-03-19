const { merge } = require('ramda')
const all = require('./index')
const handlers = require('./handlers/node')
const actions = require('./actions/node')

const nodeRun = (fn, payload, config) => {
  return all.run(handlers, fn, payload, config)
}

module.exports = merge(all, {
  run: nodeRun,
  actions
})
