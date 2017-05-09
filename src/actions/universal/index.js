const { call } = require('./call')
const { randomNumber } = require('./random-number')
const { now } = require('./now')
const { guid } = require('./guid')
const { echo } = require('./echo')
const { jsonParse } = require('./json-parse')
const { getState, setState } = require('./state')
const { logInfo, logError } = require('./log')
const { httpGet, httpPost, httpPut, httpDelete, rpc } = require('./http')

module.exports = {
  call,
  randomNumber,
  now,
  guid,
  echo,
  getState,
  setState,
  logInfo,
  logError,
  jsonParse,
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  rpc,
}
