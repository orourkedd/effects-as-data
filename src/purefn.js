const {
  map,
  pluck,
  curry,
  zip,
  merge,
  mergeAll,
  filter,
  flatten,
  reduce,
  difference,
  toPairs
} = require('ramda')
const { toArray, toPromise } = require('./util')
const PUREFN_ACTIONS = ['setPayload', 'call', 'mapPipe', 'panic', 'end', 'addToContext']

const runAction = curry((plugins, action) => {
  let plugin = plugins[action.type]

  if (typeof plugin === 'undefined') {
    throw new Error(`"${action.type}" is not a registered plugin.`)
  }

  let pluginResult = plugin(action.payload)
  return toPromise(pluginResult)
  .then((payload) => {
    return {
      success: true,
      payload
    }
  })
  .catch((error) => {
    return {
      success: false,
      error
    }
  })
})

const runActions = curry((plugins, actions) => {
  let actionRunner = runAction(plugins)
  let promises = map(actionRunner, actions)
  return Promise.all(promises).then((results) => {
    let pairs = zip(actions, results)
    let resultsForState = map(([action, result]) => {
      if (result.success === true) {
        return addToContext(action.contextKey, result.payload)
      } else {
        return addToErrors(action.contextKey, result.error)
      }
    }, pairs)

    return resultsForState
  })
})

const setPayload = (payload) => {
  return {
    type: 'setPayload',
    payload
  }
}

const addToContext = (key, value) => {
  let patch = {}
  patch[key] = value
  return {
    type: 'addToContext',
    value: patch
  }
}

const addToErrors = (key, error) => {
  let patch = {}
  patch[key] = error
  return {
    type: 'addToErrors',
    value: patch
  }
}

const end = () => {
  return {
    type: 'end'
  }
}

const runPipe = curry((plugins, pipeRaw, stateRaw, index = 0) => {
  let state = normalizeState(stateRaw)
  let pipe = normalizePipe(pipeRaw)
  if (index >= pipe.length) {
    return Promise.resolve(state)
  }

  let fn = pipe[index]
  let results = fn(state)
  let resultsAsArray = toArray(results)

  let pureFnActions = filter(isPureFnAction, resultsAsArray)
  let pluginActions = difference(resultsAsArray, pureFnActions)

  return runActions(plugins, pluginActions).then((actions) => {
    const run = (state) => runPipe(plugins, pipe, state, index + 1)

    let queue = normalizeActions(plugins, actions.concat(pureFnActions))

    return Promise.all(queue).then((actions) => {
      //  state actions
      let newState = applyActionsToState(state, actions)

      let shouldEnd = actions.some((a) => a.type === 'end')

      if (shouldEnd) {
        return newState
      } else {
        return run(newState)
      }
    })
  })
})

function applyActionsToState (state, actions) {
  return reduce((p, action) => {
    switch (action.type) {
      case 'setPayload':
        return merge(p, {payload: action.payload})

      case 'addToContext':
        return merge(p, {
          context: merge(p.context, action.value)
        })

      case 'addToErrors':
        return merge(p, {
          errors: merge(p.errors, action.value)
        })

      default:
        return p
    }
  }, state, actions)
}

function normalizeActions (plugins, actions) {
  return actions.map((action) => {
    if (action.type === 'setPayload') {
      return action
    }

    if (action.type === 'addToErrors') {
      return action
    }

    if (action.type === 'call') {
      return runPipe(plugins, action.pipe, action.state).then((state) => {
        return addToContext(action.contextKey, state)
      })
    }

    if (action.type === 'mapPipe') {
      let mapResults = map((s) => {
        return runPipe(plugins, action.pipe, s)
      }, action.state)

      return Promise.all(mapResults).then((results) => {
        return addToContext(action.contextKey, results)
      })
    }

    if (action.type === 'addToContext') {
      return action
    }

    if (action.type === 'panic') {
      throw action.error
    }

    if (action.type === 'end') {
      return end()
    }
  })
}

function mergeKey (context, key, value) {
  let patch = {}
  patch[key] = value
  return merge(context, patch)
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

function isPureFnAction ({type}) {
  return PUREFN_ACTIONS.indexOf(type) > -1
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
  runActions,
  emptyState,
  runPipe,
  normalizePipe,
  normalizeState,
  buildPipes
}
