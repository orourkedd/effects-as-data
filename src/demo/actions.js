function cacheGet (key) {
  return {
    type: 'cacheGet',
    key
  }
}

function httpGet (url) {
  return {
    type: 'httpGet',
    url
  }
}

function httpPost (url, payload) {
  return {
    type: 'httpPost',
    url,
    payload
  }
}

function sendEmail (user) {
  return {
    type: 'sendEmail',
    user
  }
}

function cacheSet (key, payload) {
  return {
    type: 'cacheSet',
    key,
    payload
  }
}

function log (message) {
  return {
    type: 'log',
    message
  }
}

function logError (error) {
  return {
    type: 'logError',
    error
  }
}

module.exports = {
  cacheGet,
  httpGet,
  httpPost,
  cacheSet,
  log,
  logError,
  sendEmail
}
