function pickErrors (fn) {
  return function ({errors}) {
    return fn(errors)
  }
}

module.exports = {
  pickErrors
}
