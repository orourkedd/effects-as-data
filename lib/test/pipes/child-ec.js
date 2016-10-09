'use strict';

var _require = require('../../actions');

var mapPipe = _require.mapPipe;
var setPayload = _require.setPayload;

var _require2 = require('ramda');

var map = _require2.map;
var reduce = _require2.reduce;

function a() {}

function b() {
  return mapPipe('value', subEC, [{ value: 1 }, { value: 1 }, { value: 1 }]);
}

function c(_ref) {
  var context = _ref.context;

  var results = map(function (_ref2) {
    var payload = _ref2.payload;
    return payload.value;
  }, context.value);
  var sum = reduce(function (p, c) {
    return p + c;
  }, 0, results);
  return setPayload({
    value: sum
  });
}

function subA(_ref3) {
  var payload = _ref3.payload;

  return setPayload({
    value: payload.value + 1
  });
}

function subB(_ref4) {
  var payload = _ref4.payload;

  return setPayload({
    value: payload.value + 1
  });
}

function subC(_ref5) {
  var payload = _ref5.payload;

  return setPayload({
    value: payload.value + 1
  });
}

var childEC = [a, a, b, c];
var subEC = [subA, subB, subC];

module.exports = {
  childEC: childEC
};
//# sourceMappingURL=child-ec.js.map