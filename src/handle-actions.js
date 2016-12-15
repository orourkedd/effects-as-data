const {
  toArray,
  toPromise,
  curry,
  map,
  normalizeListToSuccess,
  normalizeToFailure
} = require('./util')

const handleActions = (run, handlers, actions) => {
  try {
    let a1 = toArray(actions)
    let p = map((a) => {
      let plugin = handlers[a.type]
      const noPlugin = typeof plugin === 'undefined'
      if (noPlugin && a.type === 'call') {
        return run(handlers, a.fn, a.payload)
      }
      if (noPlugin) {
        throw new Error(`"${a.type}" is not a registered plugin.`)
      }
      let value
      try {
        if (typeof plugin === 'function') {
          value = plugin(a)
        } else {
          value = plugin
        }
      } catch (e) {
        value = normalizeToFailure(e)
      }
      return toPromise(value).catch(normalizeToFailure)
    }, a1)

    return Promise.all(p).then(normalizeListToSuccess)
  } catch (e) {
    const f = normalizeToFailure(e)
    return Promise.reject(f)
  }
}

module.exports = {
  handleActions: curry(handleActions)
}
