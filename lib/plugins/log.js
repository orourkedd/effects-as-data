'use strict';

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
  logPlugin: logPlugin,
  log: log
};
//# sourceMappingURL=log.js.map