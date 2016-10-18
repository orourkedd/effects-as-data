"use strict";

function pickContext(fn) {
  return function (_ref) {
    var context = _ref.context;

    return fn(context);
  };
}

module.exports = {
  pickContext: pickContext
};
//# sourceMappingURL=pick-context.js.map