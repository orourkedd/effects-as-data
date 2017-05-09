function nowFn(n) {
  return n()
}

module.exports = {
  nowFn,
  now: action => nowFn(Date.now, action),
}
