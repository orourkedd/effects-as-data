/**
 * Creates a `getState` action.  `yield` a `getState` to get application state.
 * @param {Array} [keys] an array of paths to sections of state.  For example, ['user.firstName', 'settings.showBanner']
 * @returns {Object} an action of type `getState`.
 */
function getState (keys) {
  return {
    type: 'getState',
    keys
  }
}

/**
 * Creates a `setState` action.  `yield` a `setState` to set application state.
 * @param {Object} [payload] An object that will be `merge`ed into the application state.
 * @returns {Object} an action of type `setState`.
 */
function setState (payload) {
  return {
    type: 'setState',
    payload
  }
}

module.exports = {
  getState,
  setState
}
