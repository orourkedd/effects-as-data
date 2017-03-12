const call = (fn, payload, options = {}) => {
  return {
    type: 'call',
    fn,
    payload,
    asyncAction: options.asyncAction === true
  }
}

module.exports = {
  call
}
