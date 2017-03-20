const { merge } = require('ramda')

const defaultHeaders = {
  'Content-Type': 'application/json;charset=UTF-8'
}

/**
 * Creates a `httpGet` action.  `yield` an `httpGet` action to do an http GET request.
 * @param {string} [url] the url to GET.
 * @param {Object} [headers={}] request headers.
 * @param {Object} [options={}] options for `fetch`.
 * @returns {Object} an action of type `httpGet`.
 */
function httpGet (url, headers = {}, options = {}) {
  return {
    type: 'httpGet',
    url,
    headers,
    options
  }
}

/**
 * Creates a `httpPost` action.  `yield` an `httpPost` action to do an http POST request.
 * @param {string} [url] the url to POST.
 * @param {Object} [payload] the payload to POST.
 * @param {Object} [headers={}] request headers.
 * @param {Object} [options={}] options for `fetch`.
 * @returns {Object} an action of type `httpPost`.
 */
function httpPost (url, payload, headers = {}, options = {}) {
  return {
    type: 'httpPost',
    url,
    payload,
    headers: merge(defaultHeaders, headers),
    options
  }
}

/**
 * Creates a `httpPut` action.  `yield` an `httpPut` action to do an http PUT request.
 * @param {string} [url] the url to PUT.
 * @param {Object} [payload] the payload to PUT.
 * @param {Object} [headers={}] request headers.
 * @param {Object} [options={}] options for `fetch`.
 * @returns {Object} an action of type `httpPut`.
 */
function httpPut (url, payload, headers = {}, options = {}) {
  return {
    type: 'httpPut',
    url,
    payload,
    headers: merge(defaultHeaders, headers),
    options
  }
}

/**
 * Creates a `httpDelete` action.  `yield` an `httpDelete` action to do an http DELETE request.
 * @param {string} [url] the url to DELETE.
 * @param {Object} [headers={}] request headers.
 * @param {Object} [options={}] options for `fetch`.
 * @returns {Object} an action of type `httpDelete`.
 */
function httpDelete (url, headers = {}, options = {}) {
  return {
    type: 'httpDelete',
    url,
    headers,
    options
  }
}

function rpc (url, fn, payload) {
  return httpPost(url, {
    fn,
    payload
  })
}

module.exports = {
  httpPost,
  httpPut,
  httpGet,
  httpDelete,
  rpc
}
