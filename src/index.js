const { isGenerator, toArray, toPromise, delay, uuid } = require("./util")

function call(config, handlers, fn, ...args) {
  if (!fn) return Promise.reject(new Error("A function is required."))
  const gen = fn.apply(null, args)
  const el = newExecutionLog()
  const childConfig = Object.assign({}, config)
  childConfig.cid = childConfig.cid || uuid()
  const stack = config.stack || []
  childConfig.stack = stack.concat({
    config: childConfig,
    handlers,
    fn,
    args
  })
  const start = Date.now()
  onCall({ args, fn, config: childConfig })
  return run(childConfig, handlers, fn, gen, null, el)
    .then(result => {
      const end = Date.now()
      onCallComplete({
        success: true,
        fn,
        result,
        config: childConfig,
        start,
        end,
        latency: end - start
      })
      return result
    })
    .catch(e => {
      const end = Date.now()
      onCallComplete({
        success: false,
        fn,
        result: e,
        config: childConfig,
        start,
        end,
        latency: end - start
      })
      throw e
    })
}

function run(config, handlers, fn, gen, input, el, genOperation = "next") {
  try {
    const { output, done } = getNextOutput(gen, input, genOperation)
    if (done) return toPromise(output)
    const isList = Array.isArray(output)
    const commandsList = toArray(output)
    return processCommands(config, handlers, fn, commandsList, el)
      .then(results => {
        const unwrappedResults = unwrapResults(isList, results)
        el.step++
        return run(config, handlers, fn, gen, unwrappedResults, el, "next")
      })
      .catch(e => {
        el.step++
        return run(config, handlers, fn, gen, e, el, "throw")
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

function getNextOutput(fn, input, op = "next") {
  const { value: output, done } = fn[op](input)
  return { output, done }
}

function processCommands(config, handlers, fn, commands, el) {
  try {
    const pc = (c, index) => processCommand(config, handlers, fn, c, el, index)
    const promises = commands.map(pc)
    return Promise.all(promises)
  } catch (e) {
    return Promise.reject(e)
  }
}

function processCommand(config, handlers, fn, command, el, index) {
  const start = Date.now()
  onCommand({
    command,
    fn,
    start,
    index,
    step: el.step,
    config
  })
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
        fn,
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
        fn,
        step: el.step,
        index,
        result: e,
        start,
        end
      })
      throw e
    })
}

function onCommand({ command, index, step, config, start, fn }) {
  if (!config.onCommand || typeof config.onCommand !== "function") return
  const r = {
    command,
    start,
    index,
    step,
    config,
    fn
  }
  delay(() => config.onCommand(r))
}

function onCommandComplete({
  success,
  command,
  index,
  step,
  result,
  config,
  start,
  end,
  fn
}) {
  if (
    !config.onCommandComplete ||
    typeof config.onCommandComplete !== "function"
  )
    return
  const r = {
    success,
    command,
    latency: end - start,
    start,
    end,
    index,
    step,
    result,
    config,
    fn
  }
  delay(() => config.onCommandComplete(r))
}

function onCall({ args, fn, config }) {
  if (!config.onCall || typeof config.onCall !== "function") return
  const r = {
    args,
    fn,
    config
  }
  delay(() => config.onCall(r))
}

function onCallComplete({ success, result, fn, config, start, end, latency }) {
  if (!config.onCallComplete || typeof config.onCallComplete !== "function")
    return
  const r = {
    success,
    fn,
    config,
    end,
    latency,
    result,
    start
  }
  delay(() => config.onCallComplete(r))
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
