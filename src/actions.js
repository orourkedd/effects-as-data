const call = (fn, payload) => {
  return {
    type: 'call',
    fn,
    payload
  }
}

module.exports = {
  call
}
