const { map, curry, zip, merge, filter, flatten, reduce, difference } = require('ramda')
const { toArray } = require('./util')
const PUREFN_ACTIONS = ['setPayload', 'call', 'mapPipe']

const runAction = curry((plugins, action) => {
  let plugin = plugins[action.type]

  if (typeof plugin === 'undefined') {
    throw new Error(`"${action.type}" is not a registered plugin.`)
  }

  return plugin(action.payload)
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
    let response = {
      context: {},
      errors: {}
    }
    let pairs = zip(actions, results)
    let resultsForState = reduce((p, [action, result]) => {
      if (result.success === true) {
        p.context[action.contextKey] = result.payload
      } else {
        p.errors[action.contextKey] = result.error
      }
      return p
    }, response, pairs)

    return resultsForState
  })
})

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

  return runActions(plugins, pluginActions).then((statePatch) => {
    let context = merge(state.context, statePatch.context)
    let errors = merge(state.errors, statePatch.errors)
    let newState = merge(state, {context, errors})

    const run = (state) => runPipe(plugins, pipe, state, index + 1)

    for (let i = 0; i < pureFnActions.length; i++) {
      let action = pureFnActions[i]
      if (action.type === 'setPayload') {
        newState = merge(newState, {
          payload: action.payload
        })
      }

      if (action.type === 'call') {
        return runPipe(plugins, action.pipe, action.state).then((state) => {
          return run(addToContext(newState, action.contextKey, state))
        })
      }

      if (action.type === 'mapPipe') {
        let mapResults = map((s) => {
          return runPipe(plugins, action.pipe, s)
        }, action.state)

        return Promise.all(mapResults).then((results) => {
          return run(addToContext(newState, action.contextKey, results))
        })
      }
    }

    return run(newState)
  })
})

function addToContext (state, key, value) {
  let patch = {}
  patch[key] = value
  let context = merge(state.context, patch)
  return merge(state, {context})
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

module.exports = {
  runAction,
  runActions,
  emptyState,
  runPipe,
  normalizePipe,
  normalizeState
}
