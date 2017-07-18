const { die, dieFromRejection } = require('./die')
const { echo, echoPromise } = require('./echo')
const { either } = require('../../../commands/universal/either')
const { asyncify } = require('../../../commands/universal/asyncify')

module.exports = {
  die,
  dieFromRejection,
  echo,
  echoPromise,
  either,
  asyncify
}
