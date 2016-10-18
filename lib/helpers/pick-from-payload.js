'use strict';

var _require = require('ramda');

var pluck = _require.pluck;

function pickFromPayload(keys, fn) {
  return function (_ref) {
    var payload = _ref.payload;

    var values = pluck(keys, payload);
    fn.apply(null, values);
  };
}

module.exports = {
  pickFromPayload: pickFromPayload
};
//# sourceMappingURL=pick-from-payload.js.map