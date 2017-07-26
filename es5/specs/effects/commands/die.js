'use strict';

function die() {
  var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return {
    type: 'die',
    message: message
  };
}

function dieFromRejection() {
  var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return {
    type: 'dieFromRejection',
    message: message
  };
}

module.exports = {
  die: die,
  dieFromRejection: dieFromRejection
};
//# sourceMappingURL=die.js.map