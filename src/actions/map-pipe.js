function mapPipe (contextKey, pipe, state) {
  return {
    type: 'mapPipe',
    pipe,
    contextKey,
    state
  }
}

module.exports = {
  mapPipe
}
