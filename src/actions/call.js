function call (contextKey, pipe, state) {
  return {
    type: 'call',
    pipe,
    contextKey,
    state
  }
}

module.exports = {
  call
}
