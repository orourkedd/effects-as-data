const { die, dieFromRejection } = require('./die')
const { echo, echoPromise } = require('./echo')
const { either } = require('../../../handlers/universal/either')

module.exports = {
  die,
  dieFromRejection,
  echo,
  echoPromise,
  either
}
