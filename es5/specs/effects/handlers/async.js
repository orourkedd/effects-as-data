"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var delay = (typeof setImmediate === "undefined" ? "undefined" : _typeof(setImmediate)) === undefined ? function (fn) {
  return setTimeout(fn, 0);
} : setImmediate;

function async(_ref, _ref2) {
  var cmd = _ref.cmd;
  var config = _ref2.config,
      handlers = _ref2.handlers,
      call = _ref2.call;

  delay(function () {
    call(config, handlers, regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return cmd;

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  });
}

module.exports = {
  async: async
};
//# sourceMappingURL=async.js.map