'use strict';

var _marked = [asyncTest].map(regeneratorRuntime.mark);

var cmds = require('../commands');

function asyncTest() {
  return regeneratorRuntime.wrap(function asyncTest$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return cmds.async({ type: 'test' });

        case 2:
          return _context.abrupt('return', _context.sent);

        case 3:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

module.exports = {
  asyncTest: asyncTest
};
//# sourceMappingURL=async-test.js.map