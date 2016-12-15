const { httpGet } = require('./actions')

function * singleLine (id) {
  yield httpGet(`http://example.com/api/v1/users/${id}`)
}

function * normalizeToSuccess () {
  const s1 = yield [{type: 'test'}]
  return s1
}

module.exports = {
  singleLine,
  normalizeToSuccess
}
