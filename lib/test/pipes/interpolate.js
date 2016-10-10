'use strict';

var _require = require('../../actions');

var setPayload = _require.setPayload;
var addToContext = _require.addToContext;
var interpolate = _require.interpolate;

function a(_ref) {
  var payload = _ref.payload;

  return addToContext({
    value: 1,
    doInterpolation: payload.doInterpolation
  });
}

function b(_ref2) {
  var context = _ref2.context;

  return addToContext({
    value: context.value + 1
  });
}

function c(_ref3) {
  var context = _ref3.context;

  var actions = [];
  var a1 = addToContext({
    value: context.value + 1
  });
  actions.push(a1);

  if (context.doInterpolation) {
    var a2 = interpolate(addExtra);
    actions.push(a2);
  }

  return actions;
}

function d(_ref4) {
  var context = _ref4.context;

  return setPayload(context);
}

function ai(_ref5) {
  var context = _ref5.context;

  return addToContext({
    value: context.value + 1
  });
}

function bi(_ref6) {
  var context = _ref6.context;

  return addToContext({
    value: context.value + 1
  });
}

var addExtra = [ai, bi];

module.exports = {
  interpolationTest: [a, b, c, d]
};
//# sourceMappingURL=interpolate.js.map