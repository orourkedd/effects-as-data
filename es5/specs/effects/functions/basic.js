'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _marked = [basic, basicMultiArg, basicMultistep, basicParallel, basicMultistepParallel, basicEmpty].map(regeneratorRuntime.mark);

var cmds = require('../commands');

function basic(message) {
  return regeneratorRuntime.wrap(function basic$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return cmds.echo(message);

        case 2:
          return _context.abrupt('return', _context.sent);

        case 3:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function basicMultiArg(a, b) {
  return regeneratorRuntime.wrap(function basicMultiArg$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return cmds.echo(a + b);

        case 2:
          return _context2.abrupt('return', _context2.sent);

        case 3:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

function basicMultistep(message) {
  var s1, s2;
  return regeneratorRuntime.wrap(function basicMultistep$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return cmds.echo(message + '1');

        case 2:
          s1 = _context3.sent;
          _context3.next = 5;
          return cmds.echo(message + '2');

        case 5:
          s2 = _context3.sent;
          return _context3.abrupt('return', { s1: s1, s2: s2 });

        case 7:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[2], this);
}

function basicParallel(message) {
  var _ref, _ref2, s1, s2;

  return regeneratorRuntime.wrap(function basicParallel$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return [cmds.echo(message), cmds.echo(message)];

        case 2:
          _ref = _context4.sent;
          _ref2 = _slicedToArray(_ref, 2);
          s1 = _ref2[0];
          s2 = _ref2[1];
          return _context4.abrupt('return', {
            s1: s1 + '1',
            s2: s2 + '2'
          });

        case 7:
        case 'end':
          return _context4.stop();
      }
    }
  }, _marked[3], this);
}

function basicMultistepParallel(message) {
  var _ref3, _ref4, s1, s2, _ref5, _ref6, s3, s4;

  return regeneratorRuntime.wrap(function basicMultistepParallel$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return [cmds.echo(message), cmds.echo(message)];

        case 2:
          _ref3 = _context5.sent;
          _ref4 = _slicedToArray(_ref3, 2);
          s1 = _ref4[0];
          s2 = _ref4[1];
          _context5.next = 8;
          return [cmds.echo(message), cmds.echo(message)];

        case 8:
          _ref5 = _context5.sent;
          _ref6 = _slicedToArray(_ref5, 2);
          s3 = _ref6[0];
          s4 = _ref6[1];
          return _context5.abrupt('return', {
            s1: s1 + '1',
            s2: s2 + '2',
            s3: s3 + '3',
            s4: s4 + '4'
          });

        case 13:
        case 'end':
          return _context5.stop();
      }
    }
  }, _marked[4], this);
}

function basicEmpty() {
  return regeneratorRuntime.wrap(function basicEmpty$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return [];

        case 2:
          return _context6.abrupt('return', _context6.sent);

        case 3:
        case 'end':
          return _context6.stop();
      }
    }
  }, _marked[5], this);
}

module.exports = {
  basic: basic,
  basicMultiArg: basicMultiArg,
  basicMultistep: basicMultistep,
  basicParallel: basicParallel,
  basicMultistepParallel: basicMultistepParallel,
  basicEmpty: basicEmpty
};
//# sourceMappingURL=basic.js.map