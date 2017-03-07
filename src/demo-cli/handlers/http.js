const { get } = require('simple-protocol-http')

const httpGet = (action) => {
  return get(action.url)
}

module.exports = {
  httpGet
}
