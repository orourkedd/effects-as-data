'use strict';

var _require = require('../effects-as-data');

var simplePlugin = _require.simplePlugin;

function logPlugin(_ref) {
  var message = _ref.message;

  console.info(message);
}

function log(message) {
  return {
    type: 'log',
    payload: {
      message: 'hi'
    }
  };
}

module.exports = {
  logPlugin: simplePlugin(logPlugin),
  log: log
};
//# sourceMappingURL=log.js.map