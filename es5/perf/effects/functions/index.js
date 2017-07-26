'use strict';

var _marked = [eadBenchmark].map(regeneratorRuntime.mark);

var cmds = require('../cmds');

function eadBenchmark(filePath) {
  var now;
  return regeneratorRuntime.wrap(function eadBenchmark$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return cmds.now();

        case 2:
          now = _context.sent;
          _context.next = 5;
          return cmds.writeFile(filePath, now.toString(), { encoding: 'utf8' });

        case 5:
          _context.next = 7;
          return cmds.readFile(filePath, { encoding: 'utf8' });

        case 7:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

module.exports = {
  eadBenchmark: eadBenchmark
};
//# sourceMappingURL=index.js.map