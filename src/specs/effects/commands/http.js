function httpGet(url) {
  return {
    type: 'httpGet',
    url
  }
}

module.exports = {
  httpGet
}
