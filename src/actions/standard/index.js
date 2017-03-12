const { call } = require('./call')
const { randomNumber } = require('./random-number')
const { now } = require('./now')
const { guid } = require('./guid')
const { echo } = require('./echo')
const { logInfo, logError } = require('./log')

module.exports = {
  call,
  randomNumber,
  now,
  guid,
  echo,
  logInfo,
  logError
}
