const { safecb } = require('safe-errors')

function node(action) {
  const m = require(action.module)
  const fn = m[action.function]
  return safecb(fn).apply(null, action.args)
}

module.exports = {
  node,
}
