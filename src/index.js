const { isGenerator, toArray, betterError, toPromise } = require('./util')

function call(config, handlers, fn, ...args) {
  return run(config, handlers, fn, args)
}

function run(config, handlers, fn, input, el, generatorOperation = 'next') {
  try {
    const el1 = getExecutionLog(el)
    if (!fn) {
      const noFunctionMessage =
        'A function is required. Perhaps your function is undefined?'
      throw new Error(noFunctionMessage)
    }
    const { output, isList, done, fn2 } = getNextOutput(
      fn,
      input,
      generatorOperation
    )
    if (done) return output
    const commandsList = toArray(output)
    return processCommands(config, handlers, commandsList, el1)
      .then(results => {
        const unwrappedResults = unwrapResults(isList, results)
        el1.step = el1.step + 1 // mutate in place
        return run(config, handlers, fn2, unwrappedResults, el1)
      })
      .catch(e => {
        //  ok to mutate?
        el1.step = el1.step + 1 // mutate in place
        return run(config, handlers, fn2, e, el1, 'throw')
      })
  } catch (e) {
    return Promise.reject(betterError(e))
  }
}

function getExecutionLog(el) {
  return (
    el || {
      step: 0
    }
  )
}

function unwrapResults(isList, results) {
  return isList ? results : results[0]
}

function getNextOutput(fn, input, op = 'next') {
  const g = isGenerator(fn) ? fn.apply(null, input) : fn
  const { value: output, done } = g[op](input)
  return {
    output,
    isList: Array.isArray(output),
    done,
    fn2: g
  }
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
    result = handlers[command.type](command, config, handlers)
  } catch (e) {
    result = Promise.reject(e)
  }
  return toPromise(result)
    .then(r => {
      const end = Date.now()
      report({
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
      report({
        success: false,
        config,
        command,
        step: el.step,
        index,
        result: betterError(e),
        start,
        end
      })
      throw e
    })
}

function report({ success, command, index, step, result, config, start, end }) {
  if (!config.onCommandComplete) return
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

module.exports = {
  call
}
