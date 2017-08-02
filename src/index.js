const { isGenerator, toArray, toPromise } = require('./util')

function call(config, handlers, fn, ...args) {
  if (!fn) return Promise.reject(new Error('A function is required.'))
  const gen = fn.apply(null, args)
  const el = newExecutionLog()
  onCall({ args, fn, config })
  return run(config, handlers, gen, null, el).then(result => {
    onComplete({ result, config })
    return result
  })
}

function run(config, handlers, fn, input, el, genOperation = 'next') {
  try {
    const { output, done } = getNextOutput(fn, input, genOperation)
    if (done) return toPromise(output)
    const isList = Array.isArray(output)
    const commandsList = toArray(output)
    return processCommands(config, handlers, commandsList, el)
      .then(results => {
        const unwrappedResults = unwrapResults(isList, results)
        el.step++
        return run(config, handlers, fn, unwrappedResults, el, 'next')
      })
      .catch(e => {
        el.step++
        return run(config, handlers, fn, e, el, 'throw')
      })
  } catch (e) {
    return Promise.reject(e)
  }
}

function newExecutionLog() {
  return {
    step: 0
  }
}

function unwrapResults(isList, results) {
  return isList ? results : results[0]
}

function getNextOutput(fn, input, op = 'next') {
  const { value: output, done } = fn[op](input)
  return { output, done }
}

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
  const start = Date.now()
  let result
  try {
    const handler = handlers[command.type]
    if (!handler)
      throw new Error(`Handler of type "${command.type}" is not registered.`)
    result = handler(command, { call, config, handlers })
  } catch (e) {
    result = Promise.reject(e)
  }
  return toPromise(result)
    .then(r => {
      const end = Date.now()
      onCommandComplete({
        success: true,
        config,
        command,
        step: el.step,
        index,
        result: r,
        start,
        end
      })
      return r
    })
    .catch(e => {
      const end = Date.now()
      onCommandComplete({
        success: false,
        config,
        command,
        step: el.step,
        index,
        result: e,
        start,
        end
      })
      throw e
    })
}

function onCommandComplete({ success, command, index, step, result, config, start, end }) {
  if (!config.onCommandComplete || typeof config.onCommandComplete !== 'function') return
  const r = {
    success,
    command,
    latency: end - start,
    start,
    end,
    index,
    step,
    result,
    config
  }
  config.onCommandComplete(r)
}

function onCall({ args, fn, config }) {
  if (!config.onCall || typeof config.onCall !== 'function') return
  const r = {
    args,
    fn,
    config
  };
  config.onCall(r)
}

function onComplete({ result, config }) {
  if (!config.onComplete || typeof config.onComplete !== 'function') return
  const r = {
    result,
    config
  };
  config.onComplete(r)
}

function buildFunctions(config, handlers, functions) {
  let promiseFunctions = {}
  for (let i in functions) {
    promiseFunctions[i] = function(...args) {
      const localConfig = Object.assign({ name: i }, config)
      return call(localConfig, handlers, functions[i], ...args)
    }
  }
  return promiseFunctions
}

module.exports = {
  call,
  buildFunctions
}
