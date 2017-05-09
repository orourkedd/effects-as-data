const {
  toArray,
  toPromise,
  curry,
  map,
  keys,
  normalizeListToSuccess,
  normalizeToFailure,
  success,
} = require('./util')

const handleActions = (run, handlers, config, actions) => {
  try {
    let a1 = toArray(actions)
    let p1 = map(a => {
      let handler = handlers[a.type]
      const noHandler = typeof handler === 'undefined'
      if (noHandler && a.type === 'call') {
        if (a.asyncAction === true) {
          run(handlers, a.fn, a.payload, config)
          return success()
        } else {
          return run(handlers, a.fn, a.payload, config).catch(
            normalizeToFailure
          )
        }
      }
      if (noHandler) {
        const handlerNames = keys(handlers)
        const handlerMessage = handlerNames.length
          ? `Registered handlers are: ${handlerNames.join(', ')}.`
          : 'In fact, there are no registered handlers (first argument to the run function).'
        throw new Error(
          `"${a.type}" is not a registered handler.  ${handlerMessage}`
        )
      }
      let value
      try {
        if (typeof handler === 'function') {
          value = handler(a, handlers, config)
        } else {
          value = handler
        }
      } catch (e) {
        value = normalizeToFailure(e)
      }
      return toPromise(value).catch(normalizeToFailure)
    }, a1)

    return Promise.all(p1).then(normalizeListToSuccess)
  } catch (e) {
    const f = normalizeToFailure(e)
    return Promise.reject(f)
  }
}

module.exports = {
  handleActions: curry(handleActions),
}
