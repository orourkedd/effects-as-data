const { run } = require('../../run')

function call(action, handlers, config) {
  return run(handlers, action.fn, action.payload, config)
}

module.exports = {
  call
}
