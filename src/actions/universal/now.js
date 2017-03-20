/**
 * Create an `now` action.  `yield` a `now` action to get the current timestamp from `Date.now()`.
 * @returns {Object} an action of type `now`.
 * @example const { actions, handlers, run } = require('effects-as-data/node')
 *
 * function * example () {
 *   const timestamp = yield actions.now()
 *   return timestamp
 * }
 *
 * run(handlers, example).then((timestamp) => {
 *   timestamp.payload === 1490030160103 //  true, if Date.now() returned 1490030160103
 * })
 *
 */
function now () {
  return {
    type: 'now'
  }
}

module.exports = {
  now
}
