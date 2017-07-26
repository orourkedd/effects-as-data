"use strict";

function either(_ref, _ref2) {
  var cmd = _ref.cmd,
      defaultValue = _ref.defaultValue;
  var config = _ref2.config,
      handlers = _ref2.handlers,
      call = _ref2.call;

  return call(config, handlers, regeneratorRuntime.mark(function _callee() {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return cmd;

          case 3:
            result = _context.sent;
            return _context.abrupt("return", result || defaultValue);

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", defaultValue);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 7]]);
  }));
}

module.exports = {
  either: either
};
//# sourceMappingURL=either.js.map