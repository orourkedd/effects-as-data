/**
 * Creates a `getState` action.  `yield` a `getState` to get application state.
 * @param {Array} keys an array of paths to sections of state.  For example, ['user.firstName', 'settings.showBanner']
 * @returns {Object} an action of type `getState`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should return user from application state', testExample(() => {
 *     return [
 *       [null, actions.getState(['user'])],
 *       [{ id: '123', username: 'foo' }, success({ id: '123', username: 'foo' })]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * function * example () {
 *   const user = yield actions.getState(['user'])
 *   return user
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * run(handlers, example).then((user) => {
 *   user.id === 'abc' //  true, if the user has an `id` of 'abc'
 * })
 */
function getState(keys) {
  return {
    type: 'getState',
    keys,
  }
}

/**
 * Creates a `setState` action.  `yield` a `setState` to set application state.
 * @param {Object} [payload] An object that will be `merge`ed into the application state.
 * @returns {Object} an action of type `setState`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should set a user on the application state', testExample(() => {
 *     const user = { user: '123' }
 *     return [
 *       [user, actions.setState({ user })],
 *       [null, success()]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * function * example (user) {
 *   const result = yield actions.setState({ user })
 *   return result
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * const user = { id: '123', username: 'foo' }
 * run(handlers, example, user).then((result) => {
 *   result.success === true //  true, and `user` should be available on the application state using `actions.getState(['user'])`
 * })
 */
function setState(payload) {
  return {
    type: 'setState',
    payload,
  }
}

module.exports = {
  getState,
  setState,
}
