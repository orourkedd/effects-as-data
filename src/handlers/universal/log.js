function logFn(l, { payload }) {
  return l(payload)
}

module.exports = {
  logInfoFn: logFn,
  logErrorFn: logFn,
  logInfo: action => logFn(console.info, action),
  logError: action => logFn(console.error, action),
}
