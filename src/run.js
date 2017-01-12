const {
  unwrapArgs,
  curry,
  prop,
  toPromise,
  append,
  getFailures
} = require('./util')
const { handleActions } = require('./handle-actions')

const run = (actionHandlers, fn, payload = null, config = {}) => {
  try {
    const h1 = handleActions(run, actionHandlers, config)
    return runComplete(h1, fn, payload, config).then(prop('payload'))
  } catch (e) {
    return Promise.reject(e)
  }
}

const runComplete = (handleActions, fn, payload = null, config = {}) => {
  try {
    let g = fn(payload)
    return runner(handleActions, g, payload, config)
  } catch (e) {
    return Promise.reject(e)
  }
}

const runTest = (actionHandlers, fn, payload = null) => {
  const h1 = handleActions(run, actionHandlers, {})
  return runComplete(h1, fn, payload)
}

const runner = (handleActions, g, input, config = {}, el) => {
  const el1 = getExecutionLog(el)
  let { output, done } = nextOutput(g, input)
  const returnResultsAsArray = Array.isArray(output)
  const el2 = addToExecutionLog(el1, input, output)
  if (done) return buildPayload(el2, output)
  return handleActions(output).then((actionResults1) => {
    handleFailedActions(actionResults1, el2, config)
    const actionResults2 = returnResultsAsArray ? actionResults1 : unwrapArgs(actionResults1)
    return runner(handleActions, g, actionResults2, config, el2)
  })
}

const handleFailedActions = (actionResults, el, config) => {
  const onFailure = config.onFailure || function () {}
  const failures = getFailures(actionResults)
  failures.forEach((f) => {
    const error = f.error || {}
    onFailure({
      fn: config.name,
      log: el,
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
      error
    })
  })
}

const nextOutput = (g, input) => {
  let { value: output, done } = g.next(input)
  return {
    output,
    done
  }
}

const addToExecutionLog = (el, input, output) => {
  const entry = newExecutionLogEntry(input, output)
  return append(entry, el)
}

const newExecutionLogEntry = (input, output) => {
  return [input, output]
}

const getExecutionLog = (el) => {
  return el || []
}

const buildPayload = (log, payload) => {
  return toPromise({
    payload,
    log
  })
}

module.exports = {
  runner,
  run: curry(run),
  runComplete: curry(runComplete),
  runTest: curry(runTest)
}
