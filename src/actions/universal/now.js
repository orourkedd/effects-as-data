/**
 * Create an `now` action.  `yield` a `now` action to get the current timestamp from `Date.now()`.
 * @returns {Object} an action of type `now`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should return the current timestamp', testExample(() => {
 *     return [
 *       [null, actions.now()],
 *       [123456, success(123456)]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * function * example () {
 *   const timestamp = yield actions.now()
 *   return timestamp
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * run(handlers, example).then((timestamp) => {
 *   timestamp.payload === 1490030160103 //  true, if Date.now() returned 1490030160103
 * })
 */
function now() {
  return {
    type: 'now',
  }
}

module.exports = {
  now,
}
