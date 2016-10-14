const { toPairs, reduce, merge, map } = require('ramda')
const { panic, setPayload } = require('../actions')

function resultToPayload (keys) {
  let pairs = normalizeMap(keys)
  return function ({context, errors, payload}) {
    let errorActions = map(([key, toKey]) => {
      if (errors[key]) {
        return panic(errors[key])
      }
    }, pairs)

    let newPayload = reduce((p, [key, toKey]) => {
      if (context[key]) {
        return merge(p, {
          [toKey]: context[key]
        })
      } else {
        return p
      }
    }, payload, pairs)

    return errorActions
      .concat([setPayload(newPayload)])
      .filter(v => v)
  }
}

function normalizeMap (m) {
  let keys
  if (Array.isArray(m)) {
    keys = reduce((p, c) => {
      p[c] = c
      return p
    }, {}, m)
  } else if (typeof m === 'string') {
    keys = {[m]: m}
  } else {
    keys = m
  }

  return toPairs(keys)
}

module.exports = {
  resultToPayload
}
