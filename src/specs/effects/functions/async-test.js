const cmds = require('../commands')

function* asyncTest() {
  return yield cmds.asyncify({ type: 'test' })
}

module.exports = {
  asyncTest
}
