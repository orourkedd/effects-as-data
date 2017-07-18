const cmds = require('../commands')

function* badHandler() {
  return yield cmds.die('oops')
}

function* badHandlerRejection() {
  return yield cmds.dieFromRejection('oops')
}

function* promiseReturningHandler(value) {
  return yield cmds.echoPromise(value)
}

function* valueReturningHandler(value) {
  return yield cmds.echo(value)
}

module.exports = {
  badHandler,
  badHandlerRejection,
  valueReturningHandler,
  promiseReturningHandler
}
