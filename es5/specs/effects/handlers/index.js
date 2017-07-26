'use strict';

var _require = require('./die'),
    die = _require.die,
    dieFromRejection = _require.dieFromRejection;

var _require2 = require('./echo'),
    echo = _require2.echo,
    echoPromise = _require2.echoPromise;

var _require3 = require('./either'),
    either = _require3.either;

var _require4 = require('./async'),
    async = _require4.async;

module.exports = {
  die: die,
  dieFromRejection: dieFromRejection,
  echo: echo,
  echoPromise: echoPromise,
  either: either,
  async: async
};
//# sourceMappingURL=index.js.map