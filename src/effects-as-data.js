const { map, insert, merge, flatten, reduce, toPairs } = require('ramda')
const { toArray, toPromise, keyed } = require('./util')
const { stateReducer } = require('./state-reducer')
const { addToContext, addToErrors } = require('./actions')
const { resultToContext } = require('./helpers/result-to-context')
const { resultToPayload } = require('./helpers/result-to-payload')
const { endWithPayload } = require('./helpers/end-with-payload')
const { endWithPayloadIfTruthy } = require('./helpers/end-with-payload-if-truthy')
const { pickPayload } = require('./helpers/pick-payload')
const { pickContext } = require('./helpers/pick-context')
const { pickErrors } = require('./helpers/pick-errors')
const { validateExists } = require('./helpers/validate-exists')
const { panicIfError } = require('./helpers/panic-if-error')
const actions = require('./actions')

const run = (plugins, pipeRaw, state, parentEC) => {
  let pipe = normalizePipe(pipeRaw)
  let ec = newExecutionContext(pipe, parentEC)
  let state1 = normalizeState(state)
  const allPlugins = merge(defaultPlugins, plugins)
  return runRecursive(allPlugins, state1, ec)
}

const runRecursive = (plugins, state, ec) => {
  if (isEndOfPipe(ec)) {
    return Promise.resolve(state)
  }

  let fn = pipeFn(ec)
  let result = fn(state)
  let results = toArray(result)

  return runActions(plugins, results, ec).then((actions) => {
    let state1 = stateReducer(state, actions)
    let ec1 = incrementECIndex(ec)
    let controlFlowAction = findControlFlowAction(actions)
    let ec2 = applyControlFlowAction(controlFlowAction, ec1)

    if (ec2.flow === 'end') {
      return state1
    }

    return runRecursive(plugins, state1, ec2)
  })
}

const findControlFlowAction = (actions) => {
  let controlFlowActionTypes = ['end', 'interpolate']
  return actions.find(({type}) => controlFlowActionTypes.indexOf(type) > -1)
}

const applyControlFlowAction = (action = {}, ec) => {
  switch (action.type) {
    case 'end':
      return merge(ec, {
        flow: 'end'
      })

    case 'interpolate':
      let newPipe = insert(ec.index, action.pipe, ec.pipe)
      return modifyPipe(ec, flatten(newPipe))

    default:
      return merge(ec, {
        flow: 'continue'
      })
  }
}

const newExecutionContext = (pipe, parent) => {
  return {
    index: 0,
    parent,
    pipe
  }
}

const incrementECIndex = (ec) => {
  return merge(ec, {
    index: ec.index + 1
  })
}

const modifyPipe = (ec, pipe) => {
  return merge(ec, {
    originalPipe: ec.pipe,
    pipe
  })
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
  panic: panicActionHandler,
  interpolate: stateActionHandler
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

const isEndOfPipe = (ec) => {
  return ec.index >= ec.pipe.length
}

const pipeFn = (ec) => {
  return ec.pipe[ec.index]
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

const exported = {
  emptyState,
  run,
  normalizePipe,
  normalizeState,
  setup,
  simplePlugin,
  resultToContext,
  resultToPayload,
  endWithPayload,
  endWithPayloadIfTruthy,
  pickPayload,
  pickContext,
  pickErrors,
  validateExists,
  panicIfError
}

module.exports = merge(actions, exported)
