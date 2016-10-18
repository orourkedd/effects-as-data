function pickPayload (fn) {
  return function ({payload}) {
    return fn(payload)
  }
}

module.exports = {
  pickPayload
}
