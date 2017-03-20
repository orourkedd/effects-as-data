/**
 * Creates a `logInfo` action.  `yield` a `logInfo` action to log to the console using `console.info`.
 * @param {string} [payload] the payload to log.
 * @returns {Object} an action of type `logInfo`.
 */
function logInfo (payload) {
  return {
    type: 'logInfo',
    payload
  }
}

/**
 * Creates a `logError` action.  `yield` a `logError` action to log to the console using `console.error`.
 * @param {string} [payload] the payload to log.
 * @returns {Object} an action of type `logError`.
 */
function logError (payload) {
  return {
    type: 'logError',
    payload
  }
}

module.exports = {
  logInfo,
  logError
}
