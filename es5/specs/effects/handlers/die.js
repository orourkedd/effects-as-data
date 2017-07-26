"use strict";

function die(_ref) {
  var message = _ref.message;

  throw new Error(message);
}

function dieFromRejection(_ref2) {
  var message = _ref2.message;

  return Promise.reject(new Error(message));
}

module.exports = {
  die: die,
  dieFromRejection: dieFromRejection
};
//# sourceMappingURL=die.js.map