const cmds = require("../commands");

function* eitherTestError() {
  return yield cmds.either(cmds.die("oops"), "foo");
}

function* eitherTestEmpty() {
  return yield cmds.either(cmds.echo(null), "foo");
}

module.exports = {
  eitherTestError,
  eitherTestEmpty
};
