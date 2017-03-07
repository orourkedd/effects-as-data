function httpGet (url) {
  return {
    type: 'httpGet',
    url
  }
}

function httpPost (url, payload) {
  return {
    type: 'httpPost',
    url,
    payload
  }
}

module.exports = {
  httpGet,
  httpPost
}
