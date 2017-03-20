/**
 * Creates a `jsonParse` action.  `yield` a `jsonParse` action to parse a JSON string.  Why not just use `JSON.parse()` inline?  Although a successful parsing operation is deterministic, a failed parsing operation is not.
 * @param {string} [payload] the JSON string to parse.
 * @returns {Object} an action of type `jsonParse`.
 */
function jsonParse (payload) {
  return {
    type: 'jsonParse',
    payload
  }
}

module.exports = {
  jsonParse
}
