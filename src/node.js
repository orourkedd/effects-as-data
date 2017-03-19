const { run } = require('./run')
const handlers = require('./handlers/node')

const nodeRun = (fn, payload, config) => {
  return run(handlers, fn, payload, config)
}

module.exports = {
  run: nodeRun
}