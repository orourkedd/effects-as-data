const { isGenerator, toArray, betterError } = require('./util')
const { processCommands } = require('./process-commands')

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
        return run(config, handlers, fn2, unwrappedResults, el1)
      })
      .catch(e => {
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

module.exports = {
  call
}
