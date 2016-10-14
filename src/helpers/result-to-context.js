const { toPairs, map } = require('ramda')
const { panic, addToContext } = require('../actions')

function resultToContext (keys) {
  let pairs = toPairs(keys)
  return function ({context, errors}) {
    let actions = map(([key, toKey]) => {
      if (errors[key]) {
        return panic(errors[key])
      }

      if (context[key]) {
        let p = {}
        p[toKey] = context[key]
        return addToContext(p)
      }
    }, pairs)

    return actions.filter(v => v)
  }
}

module.exports = {
  resultToContext
}
