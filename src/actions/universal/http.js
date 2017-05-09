const { merge } = require('ramda')

const defaultHeaders = {
  'Content-Type': 'application/json;charset=UTF-8',
}

/**
 * Creates a `httpGet` action.  `yield` an `httpGet` action to do an http GET request.
 * @param {string} url the url to GET.
 * @param {Object} [headers={}] request headers.
 * @param {Object} [options={}] options for `fetch`.
 * @returns {Object} an action of type `httpGet`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should return a result from GET', testExample(() => {
 *     return [
 *       [{ url: 'http://www.example.com' }, actions.httpGet('http://www.example.com')],
 *       [{ foo: 'bar' }, success({ foo: 'bar' })]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * function * example ({ url }) {
 *   const result = yield actions.httpGet(url)
 *   return result
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * const url = 'https://www.example.com/api/v1/something'
 * run(handlers, example, { url }).then((result) => {
 *   result.payload === { foo: 'bar' } //  true, if a GET to `url` returned `{ foo: 'bar' }`
 * })
 */
function httpGet(url, headers = {}, options = {}) {
  return {
    type: 'httpGet',
    url,
    headers,
    options,
  }
}

/**
 * Creates a `httpPost` action.  `yield` an `httpPost` action to do an http POST request.
 * @param {string} url the url to POST.
 * @param {Object} [payload] the payload to POST.
 * @param {Object} [headers={}] request headers.
 * @param {Object} [options={}] options for `fetch`.
 * @returns {Object} an action of type `httpPost`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should POST payload to url', testExample(() => {
 *     const url = 'http://www.example.com/api/v1/user'
 *     return [
 *       [{ url }, actions.httpPost(url, { foo: 'bar' })],
 *       [success(), success()]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * function * example (payload) {
 *   const result = yield actions.httpPost('http://www.example.com/api/v1/user', payload)
 *   return result
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * run(handlers, example, { foo: 'bar' }).then((result) => {
 *   result.success === true //  true, if a POST was successful
 * })
 */
function httpPost(url, payload, headers = {}, options = {}) {
  return {
    type: 'httpPost',
    url,
    payload,
    headers: merge(defaultHeaders, headers),
    options,
  }
}

/**
 * Creates a `httpPut` action.  `yield` an `httpPut` action to do an http PUT request.
 * @param {string} url the url to PUT.
 * @param {Object} [payload] the payload to PUT.
 * @param {Object} [headers={}] request headers.
 * @param {Object} [options={}] options for `fetch`.
 * @returns {Object} an action of type `httpPut`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should PUT payload to url', testExample(() => {
 *     const url = 'http://www.example.com/api/v1/user'
 *     return [
 *       [{ url }, actions.httpPut(url, { foo: 'bar' })],
 *       [success(), success()]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * function * example (payload) {
 *   const result = yield actions.httpPut('http://www.example.com/api/v1/user', payload)
 *   return result
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * run(handlers, example, { foo: 'bar' }).then((result) => {
 *   result.success === true //  true, if a PUT was successful
 * })
 */
function httpPut(url, payload, headers = {}, options = {}) {
  return {
    type: 'httpPut',
    url,
    payload,
    headers: merge(defaultHeaders, headers),
    options,
  }
}

/**
 * Creates a `httpDelete` action.  `yield` an `httpDelete` action to do an http DELETE request.
 * @param {string} url the url to DELETE.
 * @param {Object} [headers={}] request headers.
 * @param {Object} [options={}] options for `fetch`.
 * @returns {Object} an action of type `httpDelete`.
 * @example //  Test It
 * const { testIt } = require('effects-as-data/test')
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 * const testExample = testIt(example)
 *
 * describe('example()', () => {
 *   it('should return a result from DELETE', testExample(() => {
 *     return [
 *       [{ id: '32' }, actions.httpDelete('http://www.example.com/api/v1/user/32')],
 *       [success(), success())]
 *     ]
 *   }))
 * })
 *
 * @example //  Write It
 * const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * function * example ({ id }) {
 *   const result = yield actions.httpDelete(`http://www.example.com/api/v1/user/${id}`)
 *   return result
 * }
 *
 * @example //  Run It
 * const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
 *
 * run(handlers, example, { id: '123' }).then((result) => {
 *   result.success === true //  true, if a DELETE to http://www.example.com/api/v1/user/123 was successful
 * })
 */
function httpDelete(url, headers = {}, options = {}) {
  return {
    type: 'httpDelete',
    url,
    headers,
    options,
  }
}

function rpc(url, fn, payload) {
  return httpPost(url, {
    fn,
    payload,
  })
}

module.exports = {
  httpPost,
  httpPut,
  httpGet,
  httpDelete,
  rpc,
}
