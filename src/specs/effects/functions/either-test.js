const cmds = require('../commands')

function* eitherTest() {
  return yield cmds.either(cmds.die('oops'), 'foo')
}

function* eitherTestEmpty() {
  return yield cmds.either(cmds.echo(null), 'foo')
}

module.exports = {
  eitherTest,
  eitherTestEmpty
}
