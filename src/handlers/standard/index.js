const { echo } = require('./echo')
const { jsonParse } = require('./json-parse')
const { guid } = require('./guid')
const { now } = require('./now')
const { randomNumber } = require('./random-number')
const { logInfo, logError } = require('./log')
const { getState, setState } = require('./state')

module.exports = {
  echo,
  jsonParse,
  guid,
  now,
  randomNumber,
  logInfo,
  logError,
  getState,
  setState
}
