const { toPromise } = require('./util')

function processCommands(config, handlers, commands, el) {
  try {
    const pc = (c, index) => processCommand(config, handlers, c, el, index)
    const promises = commands.map(pc)
    return Promise.all(promises)
  } catch (e) {
    return Promise.reject(e)
  }
}

function processCommand(config, handlers, command, el, index) {
  const result = handlers[command.type](command, config, handlers)
  return toPromise(result).then(r => {
    report({
      success: true,
      config,
      command,
      step: el.step,
      index,
      result: r
    })
    return r
  })
}

function report({ success, command, index, step, result, config, start, end }) {
  if (!config.onCommandComplete) return
  const r = {
    success,
    command,
    // latency: end - start,
    // start,
    // end,
    index,
    step,
    result,
    config
  }
  config.onCommandComplete(r)
}

module.exports = {
  processCommands
}
