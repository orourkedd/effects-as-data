const cmds = require('../commands')

function* throwAtYield() {
  try {
    yield cmds.die()
  } catch (e) {
    return 'caught!'
  }
  return 'not caught'
}

function* throwAtYieldRecovery() {
  try {
    yield cmds.die()
  } catch (e) {}
  return yield cmds.echo('foo')
}

module.exports = {
  throwAtYield,
  throwAtYieldRecovery
}
