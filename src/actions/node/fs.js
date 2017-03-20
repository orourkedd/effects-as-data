/**
 * Creates a `readFile` action.  `yield` a `readFile` action to read a file using `fs.readFile`.
 * @param {string} file file path
 * @param {Object} [options={}] options for `fs.readFile`
 * @returns {Object} an action of type `readFile`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/node')
 *
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should read a file', testExample(() => {
 *     const path = '/path/to/file.txt'
 *     return [
 *       [{ path }, actions.readFile(path, { encoding: 'utf8' })],
 *       ['FOO', success()]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/node')
 *
 * function * example ({ path }) {
 *   const result = yield actions.readFile(path, { encoding: 'utf8' })
 *   return result
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/node')
 *
 * run(handlers, example, { path: '/path/to/file.txt' }).then((result) => {
 *   result.payload === 'FOO' //  true, if '/path/to/file.txt' has the content 'FOO'.
 * })
 */
function readFile (path, options) {
  return {
    type: 'node',
    module: 'fs',
    function: 'readFile',
    args: [path, options]
  }
}

/**
 * Creates a `writeFile` action.  `yield` a `writeFile` action to write a file using `fs.writeFile`.
 * @param {string} file file path
 * @param {any} the contents to write
 * @param {Object} [options={}] options for `fs.writeFile`
 * @returns {Object} an action of type `writeFile`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 *
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should write a file', testExample(() => {
 *     const path = '/path/to/file.txt'
 *     const contents = 'BAR'
 *     return [
 *       [{ path, contents }, writeFile(path, contents, { encoding: 'utf8' })],
 *       //  expect a `success` from writeFile and for the function to return the `success`
 *       [success(), success()]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/node')
 *
 * function * example ({ path, contents }) {
 *   const result = yield actions.writeFile(path, contents, { encoding: 'utf8' })
 *   return result
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/node')
 *
 * run(handlers, example, { path: '/path/to/file.txt', contents: 'FOO' }).then((result) => {
 *   result.success === true && result.payload === null //  true, if write to '/path/to/file.txt' was successful.
 * })
 */
function writeFile (path, data, options) {
  return {
    type: 'node',
    module: 'fs',
    function: 'writeFile',
    args: [path, data, options]
  }
}

module.exports = {
  readFile,
  writeFile
}
