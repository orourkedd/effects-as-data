'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _require = require('ramda');

var toPairs = _require.toPairs;
var map = _require.map;

var _require2 = require('../actions');

var panic = _require2.panic;
var addToContext = _require2.addToContext;

function resultToContext(keys) {
  var pairs = toPairs(keys);
  return function (_ref) {
    var context = _ref.context;
    var errors = _ref.errors;

    var actions = map(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2);

      var key = _ref3[0];
      var toKey = _ref3[1];

      if (errors[key]) {
        return panic(errors[key]);
      }

      if (context[key]) {
        var p = {};
        p[toKey] = context[key];
        return addToContext(p);
      }
    }, pairs);

    return actions.filter(function (v) {
      return v;
    });
  };
}

module.exports = {
  resultToContext: resultToContext
};
//# sourceMappingURL=result-to-context.js.map