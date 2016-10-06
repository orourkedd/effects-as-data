function addToContext (value) {
  return {
    type: 'addToContext',
    value
  }
}

module.exports = {
  addToContext
}
