const { merge } = require('ramda')
const all = require('./index')
const handlers = require('./handlers/universal')
const actions = require('./actions/universal')

const runUniversal = (fn, payload, config) => {
  return all.run(handlers, fn, payload, config)
}

module.exports = merge(all, {
  runUniversal,
  handlers,
  actions,
})
