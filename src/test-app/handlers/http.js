const { get, post } = require('simple-protocol-http')

function httpGet({ url }) {
  return get(url)
}

function httpPost({ url, payload }) {
  return post(url, payload)
}

module.exports = {
  httpGet,
  httpPost,
}
