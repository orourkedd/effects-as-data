const { run } = require('./run')
const handlers = require('./handlers/universal')

const universalRun = (fn, payload, config) => {
  return run(handlers, fn, payload, config)
}

module.exports = {
  run: universalRun
}