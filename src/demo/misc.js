const { httpGet } = require('./actions')

function * singleLine (id) {
  return httpGet(`http://example.com/api/v1/users/${id}`)
}

module.exports = {
  singleLine
}
