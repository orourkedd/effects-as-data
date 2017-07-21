const cmds = require('../commands')

function* asyncTest() {
  return yield cmds.async({ type: 'test' })
}

module.exports = {
  asyncTest
}
