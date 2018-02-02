const { die, dieFromRejection } = require("./die");
const { echo, echoPromise } = require("./echo");
const { either } = require("./either");
const { async } = require("./async");

module.exports = {
  die,
  dieFromRejection,
  echo,
  echoPromise,
  either,
  async
};
