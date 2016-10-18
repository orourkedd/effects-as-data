"use strict";

function pickPayload(fn) {
  return function (_ref) {
    var payload = _ref.payload;

    return fn(payload);
  };
}

module.exports = {
  pickPayload: pickPayload
};
//# sourceMappingURL=pick-payload.js.map