const { get, post } = require('simple-protocol-http')

function cacheGet ({key}) {
  return null
}

function cacheSet ({key, payload}) {
  return null
}

function httpGet ({url}) {
  return get(url)
}

function httpPost ({url, payload}) {
  return post(url, payload)
}

function sendEmail ({user}) {
  return {
    status: 'sent',
    user
  }
}

function log (message) {
  console.log(message)
}

function logError (error) {
  console.error(error)
}

module.exports = {
  cacheGet,
  cacheSet,
  httpGet,
  httpPost,
  sendEmail,
  log,
  logError
}
