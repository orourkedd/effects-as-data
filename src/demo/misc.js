const { httpGet } = require('./actions')

function * singleLine (id) {
  const s1 = yield httpGet(`http://example.com/api/v1/users/${id}`)
  return s1
}

function * normalizeToSuccess () {
  const s1 = yield [{type: 'test'}]
  return s1
}

function * yieldArray () {
  const s1 = yield [{type: 'test'}]
  return s1
}

module.exports = {
  singleLine,
  normalizeToSuccess,
  yieldArray
}
