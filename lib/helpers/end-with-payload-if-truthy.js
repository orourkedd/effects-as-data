'use strict';

var _require = require('../actions');

var setPayload = _require.setPayload;
var panic = _require.panic;
var end = _require.end;

function endWithPayloadIfTruthy(key) {
  var panicOnError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  return function (_ref) {
    var context = _ref.context;
    var errors = _ref.errors;

    var error = errors[key];
    if (panicOnError && error) {
      return panic(error);
    } else if (error) {
      //  log error using action
      console.error(error);
    }

    if (context[key]) {
      return [setPayload(context[key]), end()];
    }
  };
}

module.exports = {
  endWithPayloadIfTruthy: endWithPayloadIfTruthy
};
//# sourceMappingURL=end-with-payload-if-truthy.js.map