/**
 * Create an `randomNumber` action.  `yield` a `randomNumber` to get a random number using `Math.random()`.
 * @returns {Object} an action of type `randomNumber`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should return the current timestamp', testExample(() => {
 *     return [
 *       [null, actions.randomNumber()],
 *       [0.123, success(0.123)]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal')
 *
 * function * example () {
 *   const n = yield actions.randomNumber()
 *   return n
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal')
 *
 * run(handlers, example).then((n) => {
 *   n.payload === 0.345 //  true, if Math.random() returned 0.345
 * })
 */
function randomNumber () {
  return {
    type: 'randomNumber'
  }
}

module.exports = {
  randomNumber
}
