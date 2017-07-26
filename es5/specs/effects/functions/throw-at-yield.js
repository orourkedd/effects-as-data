'use strict';

var _marked = [throwAtYield, throwAtYieldRecovery].map(regeneratorRuntime.mark);

var cmds = require('../commands');

function throwAtYield() {
  return regeneratorRuntime.wrap(function throwAtYield$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return cmds.die();

        case 3:
          _context.next = 8;
          break;

        case 5:
          _context.prev = 5;
          _context.t0 = _context['catch'](0);
          return _context.abrupt('return', 'caught!');

        case 8:
          return _context.abrupt('return', 'not caught');

        case 9:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[0, 5]]);
}

function throwAtYieldRecovery() {
  return regeneratorRuntime.wrap(function throwAtYieldRecovery$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return cmds.die();

        case 3:
          _context2.next = 7;
          break;

        case 5:
          _context2.prev = 5;
          _context2.t0 = _context2['catch'](0);

        case 7:
          _context2.next = 9;
          return cmds.echo('foo');

        case 9:
          return _context2.abrupt('return', _context2.sent);

        case 10:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this, [[0, 5]]);
}

module.exports = {
  throwAtYield: throwAtYield,
  throwAtYieldRecovery: throwAtYieldRecovery
};
//# sourceMappingURL=throw-at-yield.js.map