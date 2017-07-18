const { toPromise } = require('./util')

function processCommands(config, handlers, commands) {
  try {
    const pc = c => processCommand(config, handlers, c)
    const promises = commands.map(pc)
    return Promise.all(promises)
  } catch (e) {
    return Promise.reject(e)
  }
}

function processCommand(config, handlers, command) {
  const result = handlers[command.type](command, config, handlers)
  return toPromise(result)
}

module.exports = {
  processCommands
}
