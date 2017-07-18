const { toPromise } = require('./util')

function processCommands(config, handlers, commands) {
  const cmdMapper = c => processCommand(config, handlers, c)
  const promises = commands.map(cmdMapper)
  return Promise.all(promises)
}

function processCommand(config, handlers, command) {
  const result = handlers[command.type](command)
  return toPromise(result)
}

module.exports = {
  processCommands
}
