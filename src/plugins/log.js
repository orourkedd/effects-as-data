function logPlugin ({message}) {
  console.info(message)
}

function log (message) {
  return {
    type: 'log',
    payload: {
      message: 'hi'
    }
  }
}

module.exports = {
  logPlugin,
  log
}
