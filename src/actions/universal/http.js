const { merge } = require('ramda')

const defaultHeaders = {
  'Content-Type': 'application/json;charset=UTF-8'
}

function httpGet (url, headers = {}, options = {}) {
  return {
    type: 'httpGet',
    url,
    headers,
    options
  }
}

function httpPost (url, payload, headers = {}, options = {}) {
  return {
    type: 'httpPost',
    url,
    payload,
    headers: merge(defaultHeaders, headers),
    options
  }
}

function httpPut (url, payload, headers = {}, options = {}) {
  return {
    type: 'httpPut',
    url,
    payload,
    headers: merge(defaultHeaders, headers),
    options
  }
}

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
