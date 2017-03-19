function getState (keys) {
  return {
    type: 'getState',
    keys
  }
}

function setState (payload) {
  return {
    type: 'setState',
    payload
  }
}

module.exports = {
  getState,
  setState
}
