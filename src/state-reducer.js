const { curry, reduce, merge } = require('ramda')

const stateReducer = curry((state, actions) => {
  return reduce((p, action) => {
    switch (action.type) {
      case 'setPayload':
        return merge(p, {
          payload: action.payload
        })

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
})

module.exports = {
  stateReducer
}
