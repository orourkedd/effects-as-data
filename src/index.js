const { isGenerator, toArray, toPromise } = require('./util')

function call(config, handlers, fn, ...args) {
  if (!fn) {
    const noFunctionMessage =
      'A function is required. Perhaps your function is undefined?'
    return Promise.reject(new Error(noFunctionMessage))
  }
  const g = fn.apply(null, args)
  return run(config, handlers, g, args)
}

function run(config, handlers, fn, input, el, generatorOperation = 'next') {
  try {
    const el1 = getExecutionLog(el)
    const { output, isList, done } = getNextOutput(
      fn,
      input,
      generatorOperation
    )
    if (done) return toPromise(output)
    const commandsList = toArray(output)
    return processCommands(config, handlers, commandsList, el1)
      .then(results => {
        const unwrappedResults = unwrapResults(isList, results)
        el1.step = el1.step + 1 // mutate in place
        return run(config, handlers, fn, unwrappedResults, el1)
      })
      .catch(e => {
        //  ok to mutate?
        el1.step = el1.step + 1 // mutate in place
        return run(config, handlers, fn, e, el1, 'throw')
      })
  } catch (e) {
    return Promise.reject(e)
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
  const { value: output, done } = fn[op](input)
  return {
    output,
    isList: Array.isArray(output),
    done
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
    result = handlers[command.type](command, { call, config, handlers })
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
        result: e,
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
