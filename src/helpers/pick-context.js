function pickContext (fn) {
  return function ({context}) {
    return fn(context)
  }
}

module.exports = {
  pickContext
}
