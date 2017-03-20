/**
 * Creates a `call` action.  `yield` a `call` action to call another effects-as-data function.  `call` is used to compose effects-as-data functions in a testible manner.
 * @param {Function} [fn] an effects-as-data generator function.
 * @param {any} [payload] the payload for the effects-as-data function.
 * @param {Object} [options={}] options for `call`
 * @returns {Object} an action of type `call`.
 */
function call (fn, payload, options = {}) {
  return {
    type: 'call',
    fn,
    payload,
    asyncAction: options.asyncAction === true
  }
}

module.exports = {
  call
}
