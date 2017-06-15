const { call } = require('./call')
const { echo } = require('./echo')
const { jsonParse } = require('./json-parse')
const { guid } = require('./guid')
const { now } = require('./now')
const { randomNumber } = require('./random-number')
const { logInfo, logError } = require('./log')
const { getState, setState } = require('./state')
const { httpGet, httpPost, httpPut, httpDelete } = require('./http')

module.exports = {
  call,
  echo,
  jsonParse,
  guid,
  now,
  randomNumber,
  logInfo,
  logError,
  getState,
  setState,
  httpGet,
  httpPost,
  httpPut,
  httpDelete
}
