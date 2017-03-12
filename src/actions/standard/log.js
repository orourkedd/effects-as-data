function logInfo (payload) {
  return {
    type: 'logInfo',
    payload
  }
}

function logError (payload) {
  return {
    type: 'logError',
    payload
  }
}

module.exports = {
  logInfo,
  logError
}
