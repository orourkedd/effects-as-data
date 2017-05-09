const { get, post, put, remove } = require('simple-protocol-http').options
const { merge } = require('ramda')

function httpGetFn(get, { url, headers, options }) {
  const o = mergeOptions(options, headers)
  return get(o, url)
}

function httpPostFn(post, { url, payload, headers, options }) {
  const o = mergeOptions(options, headers)
  return post(o, url, payload)
}

function httpPutFn(put, { url, payload, headers, options }) {
  const o = mergeOptions(options, headers)
  return put(o, url, payload)
}

function httpDeleteFn(remove, { url, headers, options }) {
  const o = mergeOptions(options, headers)
  return remove(o, url)
}

function mergeOptions(options = {}, headers = {}) {
  return merge(options, { headers })
}

module.exports = {
  httpPostFn,
  httpPost: payload => httpPostFn(post, payload),
  httpPutFn,
  httpPut: payload => httpPutFn(put, payload),
  httpGetFn,
  httpGet: payload => httpGetFn(get, payload),
  httpDeleteFn,
  httpDelete: payload => httpDeleteFn(remove, payload),
}
