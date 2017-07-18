const cmds = require('../commands')

function* basic(message) {
  return yield cmds.echo(message)
}

function* basicMultistep(message) {
  const s1 = yield cmds.echo(message + '1')
  const s2 = yield cmds.echo(message + '2')
  return { s1, s2 }
}

function* basicParallel(message) {
  const [s1, s2] = yield [cmds.echo(message), cmds.echo(message)]
  return {
    s1: s1 + '1',
    s2: s2 + '2'
  }
}

function* basicMultistepParallel(message) {
  const [s1, s2] = yield [cmds.echo(message), cmds.echo(message)]
  const [s3, s4] = yield [cmds.echo(message), cmds.echo(message)]
  return {
    s1: s1 + '1',
    s2: s2 + '2',
    s3: s3 + '3',
    s4: s4 + '4'
  }
}

function* basicEmpty() {
  return yield []
}

module.exports = {
  basic,
  basicMultistep,
  basicParallel,
  basicMultistepParallel,
  basicEmpty
}
