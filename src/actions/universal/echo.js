/**
 * Creates an `echo` action.  `yield` an `echo` action for the handler to return `payload`.  This is used as a placeholder when multiple actions are being `yield`ed and some of the actions need to be `yield`ed conditionally.
 * @param {any} [payload] the value to be returns from the handler.
 * @returns {Object} an action of type `echo`.
 */
function echo (payload) {
  return {
    type: 'echo',
    payload
  }
}

module.exports = {
  echo
}
