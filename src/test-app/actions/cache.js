function cacheGet(key) {
  return {
    type: 'cacheGet',
    key,
  }
}

function cacheSet(key, payload) {
  return {
    type: 'cacheSet',
    key,
    payload,
  }
}

module.exports = {
  cacheGet,
  cacheSet,
}
