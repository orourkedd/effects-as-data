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

const addToErrors = (key, value) => {
  let patch = {}
  patch[key] = value
  return {
    type: 'addToErrors',
    value: patch
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
    // let context = merge(state.context, statePatch.context)
    // let errors = merge(state.errors, statePatch.errors)
    // let newState = merge(state, {context, errors})
    let newState = state

    const run = (state) => runPipe(plugins, pipe, state, index + 1)

    let queue = actions.concat(pureFnActions).map((action) => {
      if (action.type === 'setPayload') {
        return {
          payload: action.payload
        }
      }

      if (action.type === 'addToErrors') {
        let newErrors = merge(newState.errors, action.value)
        return {
          errors: newErrors
        }
      }

      if (action.type === 'call') {
        return runPipe(plugins, action.pipe, action.state).then((state) => {
          return {
            context: mergeKey(newState.context, action.contextKey, state)
          }
        })
      }

      if (action.type === 'mapPipe') {
        let mapResults = map((s) => {
          return runPipe(plugins, action.pipe, s)
        }, action.state)

        return Promise.all(mapResults).then((results) => {
          return {
            context: mergeKey(newState.context, action.contextKey, results)
          }
        })
      }

      if (action.type === 'addToContext') {
        let newContext = merge(newState.context, action.value)
        return {
          context: newContext
        }
      }

      if (action.type === 'panic') {
        return Promise.reject(action.error)
      }

      if (action.type === 'end') {
        return {
          end: true
        }
      }
    })

    let promises = map((q) => {
      return toPromise(q)
    }, queue)
    return Promise.all(promises).then((patches) => {
      let pluckContexts = pluck(['context'])
      let pluckErrors = pluck(['errors'])
      let contexts = pluckContexts(patches)
      let errors = pluckErrors(patches)
      let { end } = mergeAll(patches)
      let newContext = merge(newState.context, mergeAll(contexts))
      let newPayload = reduce((p, c) => {
        if (c.payload) {
          return c.payload
        }
        return p
      }, {}, [].concat(newState, patches))
      let newErrors = merge(newState.errors, mergeAll(errors))
      let n = {
        context: newContext,
        errors: newErrors,
        payload: newPayload
      }
      if (end === true) {
        return n
      }
      return run(n)
    })
  })
})

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
