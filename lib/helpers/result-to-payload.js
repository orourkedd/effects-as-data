'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('ramda');

var toPairs = _require.toPairs;
var reduce = _require.reduce;
var merge = _require.merge;
var map = _require.map;

var _require2 = require('../actions');

var panic = _require2.panic;
var setPayload = _require2.setPayload;

function resultToPayload(keys) {
  var pairs = normalizeMap(keys);
  return function (_ref) {
    var context = _ref.context;
    var errors = _ref.errors;
    var payload = _ref.payload;

    var errorActions = map(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2);

      var key = _ref3[0];
      var toKey = _ref3[1];

      if (errors[key]) {
        return panic(errors[key]);
      }
    }, pairs);

    var newPayload = reduce(function (p, _ref4) {
      var _ref5 = _slicedToArray(_ref4, 2);

      var key = _ref5[0];
      var toKey = _ref5[1];

      if (context[key]) {
        return merge(p, _defineProperty({}, toKey, context[key]));
      } else {
        return p;
      }
    }, payload, pairs);

    return errorActions.concat([setPayload(newPayload)]).filter(function (v) {
      return v;
    });
  };
}

function normalizeMap(m) {
  var keys = undefined;
  if (Array.isArray(m)) {
    keys = reduce(function (p, c) {
      p[c] = c;
      return p;
    }, {}, m);
  } else if (typeof m === 'string') {
    keys = _defineProperty({}, m, m);
  } else {
    keys = m;
  }

  return toPairs(keys);
}

module.exports = {
  resultToPayload: resultToPayload
};
//# sourceMappingURL=result-to-payload.js.map