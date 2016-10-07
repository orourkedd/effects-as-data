const { map, keys, curry, merge, flatten, reduce, toPairs } = require('ramda')
const { toArray, toPromise, keyed } = require('./util')
const { stateReducer } = require('./state-reducer')
const { addToContext, addToErrors } = require('./actions')

const runPipe = curry((plugins, pipeRaw, state, index = 0) => {
  let wrappedPlugins = reduce((p, name) => {
    p[name] = (allPlugins, action) => {
      let result = plugins[name](action.payload)
      return resultToStateAction(action, result)
    }
    return p
  }, {}, keys(plugins))

  return runPipeRecursive(wrappedPlugins, pipeRaw, state, index)
})

const runPipeRecursive = curry((plugins, pipeRaw, state, index = 0) => {
  let state1 = normalizeState(state)
  let pipe = normalizePipe(pipeRaw)

  if (isEndOfPipe(pipe, index)) {
    return Promise.resolve(state1)
  }

  let fn = pipeFn(pipe, index)
  let result = fn(state1)
  let results = toArray(result)

  return runActions(merge(defaultPlugins, plugins), results).then((actions) => {
    let state2 = stateReducer(state1, actions)
    let shouldEnd = actions.some((a) => a.type === 'end')
    return shouldEnd ? state2 : runPipeRecursive(plugins, pipe, state2, index + 1)
  })
})

function runActions (plugins, actions) {
  // let promises = map(routeActionToHandler(plugins), actions)
  let promises = map((action) => {
    return plugins[action.type](plugins, action)
  }, actions)
  return Promise.all(promises)
}

// const routeActionToHandler = curry((plugins, action) => {
//   let handler = defaultPlugins[action.type] || runAction
//   return handler(plugins, action)
// })

const runAction = curry((plugins, action) => {
  let plugin = plugins[action.type]

  if (typeof plugin === 'undefined') {
    throw new Error(`"${action.type}" is not a registered plugin.`)
  }

  let pluginResult = plugin(action.payload)
  return resultToStateAction(action, pluginResult)
})

const stateActionHandler = (plugins, action) => {
  return action
}

const callActionHandler = (plugins, action) => {
  return runPipeRecursive(plugins, action.pipe, action.state).then((state) => {
    return addToContext(keyed(action.contextKey, state))
  })
}

const mapPipeActionHandler = (plugins, action) => {
  let mapResults = map((s) => {
    return runPipeRecursive(plugins, action.pipe, s)
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

function resultToStateAction (action, pluginResult) {
  return toPromise(pluginResult)
  .then((payload) => {
    return addToContext(keyed(action.contextKey, payload))
  })
  .catch((error) => {
    return addToErrors(keyed(action.contextKey, error))
  })
}

function isEndOfPipe (pipe, i) {
  return i >= pipe.length
}

function pipeFn (pipe, i) {
  return pipe[i]
}

function normalizeState (state) {
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

function normalizePipe (pipe) {
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

const buildPipes = (plugins, pipes) => {
  let pairs = toPairs(pipes)
  return reduce((p, [key, pipe]) => {
    p[key] = (state = {}) => {
      return runPipe(plugins, pipe, state)
    }
    return p
  }, {}, pairs)
}

module.exports = {
  runAction,
  emptyState,
  runPipe,
  normalizePipe,
  normalizeState,
  buildPipes
}
