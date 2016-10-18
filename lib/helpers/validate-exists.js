'use strict';

var _require = require('../actions');

var panic = _require.panic;

function validateExists(keys) {
  return function (_ref) {
    var payload = _ref.payload;

    var actions = keys.map(function (key) {
      if (!payload[key]) {
        return panic(key + ' is required');
      }
    });

    return actions.filter(function (v) {
      return v;
    });
  };
}

module.exports = {
  validateExists: validateExists
};
//# sourceMappingURL=validate-exists.js.map