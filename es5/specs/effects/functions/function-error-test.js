'use strict';

var _marked = [functionErrorTest].map(regeneratorRuntime.mark);

function functionErrorTest() {
  return regeneratorRuntime.wrap(function functionErrorTest$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          throw new Error('oops!');

        case 1:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

module.exports = {
  functionErrorTest: functionErrorTest
};
//# sourceMappingURL=function-error-test.js.map