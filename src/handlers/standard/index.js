const { echo } = require('./echo')
const { guid } = require('./guid')
const { now } = require('./now')
const { randomNumber } = require('./random-number')
const { logInfo, logError } = require('./log')

module.exports = {
  echo,
  guid,
  now,
  randomNumber,
  logInfo,
  logError
}
