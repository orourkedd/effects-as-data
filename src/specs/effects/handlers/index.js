const { die, dieFromRejection } = require('./die')
const { echo, echoPromise } = require('./echo')
const { either } = require('../../../handlers/universal/either')
const { asyncify } = require('../../../handlers/universal/asyncify')

module.exports = {
  die,
  dieFromRejection,
  echo,
  echoPromise,
  either,
  asyncify
}
