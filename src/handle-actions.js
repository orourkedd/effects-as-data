const {
  addIndex,
  curry,
  failure,
  keys,
  map,
  merge,
  normalizeListToSuccess,
  normalizeToFailure,
  normalizeToSuccess,
  pipe,
  success,
  toArray,
  toPromise
} = require('./util')
const mapIndex = addIndex(map)

const handleAction = curry((handlers, config, step, action, index) => {
  const handler = getHandler(handlers, action, config, { index, step })
  return handler(action, handlers, config)
})

const handleActions = (run, handlers, config, actions, step = 0) => {
  const actionHandler = handleAction(handlers, config, step)
  const handleAllActions = pipe(toArray, mapIndex(actionHandler))
  return Promise.resolve(actions)
    .then(handleAllActions)
    .then(Promise.all.bind(Promise))
    .then(normalizeListToSuccess)
    .catch(e => {
      throw normalizeToFailure(e)
    })
}

function getHandler(handlers, action, config, stats) {
  const start = Date.now()
  const report = (end, result) => {
    reportLatency(config.onActionComplete, {
      action,
      latency: end - start,
      start,
      end,
      index: stats.index,
      step: stats.step,
      result,
      config
    })
  }

  const handler = handlers[action.type]
  blowUpIfHandlerIsMissing(handlers, handler, action)
  //  used only for testing with fake handlers
  if (typeof handler !== 'function') return () => toPromise(handler)
  return function() {
    let value
    try {
      const result = handler.apply(null, arguments)
      if (action.asyncAction) {
        value = success()
        //  asynchronously resolve and report on this action
        result.then(() => {
          const end = Date.now()
          report(end, null)
        })
      } else {
        value = result
      }
    } catch (e) {
      value = normalizeToFailure(e)
    }
    return toPromise(value)
      .catch(normalizeToFailure)
      .then(normalizeToSuccess)
      .then(result => {
        const end = Date.now()
        report(end, result)
        return result
      })
  }
}

function blowUpIfHandlerIsMissing(handlers, handler, action) {
  if (typeof handler !== 'undefined') return
  const handlerNames = keys(handlers)
  const handlerMessage = handlerNames.length
    ? `Registered handlers are: ${handlerNames.join(', ')}.`
    : 'In fact, there are no registered handlers (first argument to the run function).'
  throw new Error(
    `"${action.type}" is not a registered handler.  ${handlerMessage}`
  )
}

function reportLatency(callback, action, stats) {
  if (!callback) return
  callback(action, stats)
}

module.exports = {
  handleActions: curry(handleActions)
}
