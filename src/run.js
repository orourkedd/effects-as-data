const {
  unwrapArgs,
  curry,
  prop,
  toPromise,
  append
} = require('./util')
const { handleActions } = require('./handle-actions')

const run = (actionHandlers, fn, payload = null) => {
  return runComplete(actionHandlers, fn, payload).then(prop('payload'))
}

const runComplete = (actionHandlers, fn, payload = null) => {
  let g = fn(payload)
  const actionHandler = handleActions(run, actionHandlers)
  return runner(actionHandler, g, payload)
}

const runner = async (handleActions, g, input, el) => {
  const el1 = getExecutionLog(el)
  let { output, done } = nextOutput(g, input)
  const returnResultsAsArray = Array.isArray(output)
  const el2 = addToExecutionLog(el1, input, output)
  if (done) return buildPayload(el2, output)
  const actionResults1 = await handleActions(output)
  const actionResults2 = returnResultsAsArray ? actionResults1 : unwrapArgs(actionResults1)
  return runner(handleActions, g, actionResults2, el2)
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
  runTest: curry(runComplete)
}
