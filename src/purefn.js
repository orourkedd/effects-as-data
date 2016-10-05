const { map, curry, zip, merge, filter, flatten, reduce, difference } = require('ramda')
const { toArray } = require('./util')
const PUREFN_ACTIONS = ['setPayload']

const runAction = curry((plugins, action) => {
  let plugin = plugins[action.type]
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

const runPipe = curry((plugins, pipeRaw, state, index = 0) => {
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

    pureFnActions.forEach((action) => {
      if (action.type === 'setPayload') {
        newState = merge(newState, {
          payload: action.payload
        })
      }
    })

    return runPipe(plugins, pipe, newState, index + 1)
  })
})

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
  normalizePipe
}
