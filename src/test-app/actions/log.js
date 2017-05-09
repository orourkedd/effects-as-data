function log(message) {
  return {
    type: 'log',
    message,
  }
}

function logError(error) {
  return {
    type: 'logError',
    error,
  }
}

module.exports = {
  log,
  logError,
}
