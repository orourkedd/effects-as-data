"use strict";

function pickErrors(fn) {
  return function (_ref) {
    var errors = _ref.errors;

    return fn(errors);
  };
}

module.exports = {
  pickErrors: pickErrors
};
//# sourceMappingURL=pick-errors.js.map