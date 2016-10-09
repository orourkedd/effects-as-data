const { map, merge, flatten, reduce, toPairs } = require('ramda')
const { toArray, toPromise, keyed } = require('./util')
const { stateReducer } = require('./state-reducer')
const { addToContext, addToErrors } = require('./actions')

const run = (plugins, pipeRaw, state, parentEC) => {
  let ec = newExecutionContext(parentEC)
  const allPlugins = merge(defaultPlugins, plugins)
  return runRecursive(allPlugins, pipeRaw, state, ec)
}

const runRecursive = (plugins, pipe, state, ec) => {
  let state1 = normalizeState(state)
  let pipe1 = normalizePipe(pipe)

  if (isEndOfPipe(pipe1, ec)) {
    return Promise.resolve(state1)
  }

  let fn = pipeFn(pipe1, ec)
  let result = fn(state1)
  let results = toArray(result)

  return runActions(plugins, results, ec).then((actions) => {
    let state2 = stateReducer(state1, actions)
    let controlFlowAction = actions.find((a) => ['end'].indexOf(a.type) > -1)
    let ec1 = incrementECIndex(ec)
    let ec2 = applyControlFlowAction(controlFlowAction, ec1)

    if (ec2.end) {
      return state2
    }

    return runRecursive(plugins, pipe1, state2, ec2)
  })
}

const applyControlFlowAction = (action = {}, ec) => {
  switch (action.type) {
    case 'end':
      return merge(ec, {
        end: true
      })

    default:
      return ec
  }
}

const newExecutionContext = (parent) => {
  return {
    index: 0,
    parent
  }
}

const runActions = (plugins, actions, ec) => {
  let promises = map((action) => {
    return plugins[action.type](plugins, action, ec)
  }, actions)
  return Promise.all(promises)
}

const stateActionHandler = (plugins, action) => {
  return action
}

const callActionHandler = (plugins, action, ec) => {
  return run(plugins, action.pipe, action.state, ec).then((state) => {
    return addToContext(keyed(action.contextKey, state))
  })
}

const mapPipeActionHandler = (plugins, action, ec) => {
  let mapResults = map((s) => {
    return run(plugins, action.pipe, s, ec)
  }, action.state)

  return Promise.all(mapResults).then((results) => {
    return addToContext(keyed(action.contextKey, results))
  })
}

const panicActionHandler = (plugins, action) => {
  return Promise.reject(action.error)
}

const defaultPlugins = {
  setPayload: stateActionHandler,
  addToErrors: stateActionHandler,
  addToContext: stateActionHandler,
  end: stateActionHandler,
  call: callActionHandler,
  mapPipe: mapPipeActionHandler,
  panic: panicActionHandler
}

const resultToStateAction = (action, pluginResult) => {
  return toPromise(pluginResult)
  .then((payload) => {
    return addToContext(keyed(action.contextKey, payload))
  })
  .catch((error) => {
    return addToErrors(keyed(action.contextKey, error))
  })
}

const incrementECIndex = (executionContext) => {
  return merge(executionContext, {
    index: executionContext.index + 1
  })
}

const isEndOfPipe = (pipe, ec) => {
  return ec.index >= pipe.length
}

const pipeFn = (pipe, ec) => {
  return pipe[ec.index]
}

const normalizeState = (state) => {
  if (!state) {
    return emptyState()
  }

  if (state.context && state.errors && state.payload) {
    return state
  }

  return merge(emptyState(), {
    payload: state
  })
}

const normalizePipe = (pipe) => {
  let pipeAsArray = toArray(pipe)
  return flatten(pipeAsArray)
}

const emptyState = () => {
  return {
    context: {},
    payload: {},
    errors: {}
  }
}

const setup = (plugins, pipes) => {
  let pairs = toPairs(pipes)
  return reduce((p, [key, pipe]) => {
    p[key] = (state = {}) => {
      return run(plugins, pipe, state)
    }
    return p
  }, {}, pairs)
}

const simplePlugin = (fn) => {
  return function (plugins, action) {
    let result = fn(action.payload)
    return resultToStateAction(action, result)
  }
}

module.exports = {
  emptyState,
  run,
  normalizePipe,
  normalizeState,
  setup,
  simplePlugin
}
