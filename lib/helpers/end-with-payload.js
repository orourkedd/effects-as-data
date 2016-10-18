'use strict';

var _require = require('../actions');

var panic = _require.panic;
var setPayload = _require.setPayload;

function endWithPayload(key, defaultValue) {
  var shouldPanic = defaultValue === undefined;
  return function (_ref) {
    var context = _ref.context;
    var errors = _ref.errors;

    if (errors[key]) {
      if (shouldPanic) {
        return panic(errors[key]);
      } else {
        return [setPayload(defaultValue)];
      }
    } else {
      return setPayload(context[key]);
    }
  };
}

module.exports = {
  endWithPayload: endWithPayload
};
//# sourceMappingURL=end-with-payload.js.map