function jsonParse (payload) {
  return {
    type: 'jsonParse',
    payload
  }
}

module.exports = {
  jsonParse
}
