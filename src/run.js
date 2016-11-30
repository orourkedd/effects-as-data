const {
  unwrapArgs,
  curry,
  prop,
  pick,
  map
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

const runner = (handleActions, g, args, ec) => {
  ec = ec || newExecutionContext()
  let { value, done } = g.next(args)

  let ecResult = {
    actions: [],
    results: [],
    isArray: false
  }

  ecResult.isArray = Array.isArray(value)

  if (done) {
    const log = cleanLog(ec.log)
    return Promise.resolve({
      payload: value,
      ec,
      log
    })
  }

  if (Array.isArray(value)) {
    ecResult.actions = value
  } else {
    ecResult.actions.push(value)
  }

  return handleActions(value).then((args1) => {
    ecResult.results.push(args1)
    ec.log.push(ecResult)
    let args2 = ecResult.isArray ? args1 : unwrapArgs(args1)
    return runner(handleActions, g, args2, ec)
  })
}

const logPicker = pick(['actions', 'results'])
const cleanLog = map(logPicker)

const newExecutionContext = () => {
  return {
    log: []
  }
}

module.exports = {
  runner,
  run: curry(run),
  runComplete: curry(runComplete),
  runTest: curry(runComplete),
  cleanLog,
  newExecutionContext
}
