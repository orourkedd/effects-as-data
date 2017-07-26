'use strict';

var _marked = [eitherTestError, eitherTestEmpty].map(regeneratorRuntime.mark);

var cmds = require('../commands');

function eitherTestError() {
  return regeneratorRuntime.wrap(function eitherTestError$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return cmds.either(cmds.die('oops'), 'foo');

        case 2:
          return _context.abrupt('return', _context.sent);

        case 3:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function eitherTestEmpty() {
  return regeneratorRuntime.wrap(function eitherTestEmpty$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return cmds.either(cmds.echo(null), 'foo');

        case 2:
          return _context2.abrupt('return', _context2.sent);

        case 3:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

module.exports = {
  eitherTestError: eitherTestError,
  eitherTestEmpty: eitherTestEmpty
};
//# sourceMappingURL=either-test.js.map