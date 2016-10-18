'use strict';

var _require = require('../actions');

var panic = _require.panic;

function panicIfError(key) {
  return function (_ref) {
    var errors = _ref.errors;

    if (errors[key]) {
      return panic(errors[key]);
    }
  };
}

module.exports = {
  panicIfError: panicIfError
};
//# sourceMappingURL=panic-if-error.js.map