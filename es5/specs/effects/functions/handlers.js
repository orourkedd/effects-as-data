'use strict';

var _marked = [badHandler, badHandlerRejection, promiseReturningHandler, valueReturningHandler].map(regeneratorRuntime.mark);

var cmds = require('../commands');

function badHandler() {
  return regeneratorRuntime.wrap(function badHandler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return cmds.die('oops');

        case 2:
          return _context.abrupt('return', _context.sent);

        case 3:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function badHandlerRejection() {
  return regeneratorRuntime.wrap(function badHandlerRejection$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return cmds.dieFromRejection('oops');

        case 2:
          return _context2.abrupt('return', _context2.sent);

        case 3:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

function promiseReturningHandler(value) {
  return regeneratorRuntime.wrap(function promiseReturningHandler$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return cmds.echoPromise(value);

        case 2:
          return _context3.abrupt('return', _context3.sent);

        case 3:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[2], this);
}

function valueReturningHandler(value) {
  return regeneratorRuntime.wrap(function valueReturningHandler$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return cmds.echo(value);

        case 2:
          return _context4.abrupt('return', _context4.sent);

        case 3:
        case 'end':
          return _context4.stop();
      }
    }
  }, _marked[3], this);
}

module.exports = {
  badHandler: badHandler,
  badHandlerRejection: badHandlerRejection,
  valueReturningHandler: valueReturningHandler,
  promiseReturningHandler: promiseReturningHandler
};
//# sourceMappingURL=handlers.js.map