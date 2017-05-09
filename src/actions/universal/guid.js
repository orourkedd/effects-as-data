/**
 * Creates a `guid` action.  `yield` a `guid` action to get a shiny new guid.
 * @returns {Object} an action of type `guid`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should return a guid', testExample(() => {
 *     return [
 *       [null, actions.guid()],
 *       ['83feb66e-cf36-40a3-ad23-a150f0b7ed4d', success('83feb66e-cf36-40a3-ad23-a150f0b7ed4d')]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * function * example () {
 *   const result = yield actions.guid()
 *   return result
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * run(handlers, example).then((result) => {
 *   result.payload === '15270902-2798-4c34-aaa8-9a55726b58af' //  true, if `uuid.v4()` returned '15270902-2798-4c34-aaa8-9a55726b58af'
 * })
 */
function guid() {
  return {
    type: 'guid',
  }
}

module.exports = {
  guid,
}
