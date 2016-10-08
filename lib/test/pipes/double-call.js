'use strict';

var _require = require('../../actions');

var call = _require.call;
var setPayload = _require.setPayload;

var _require2 = require('ramda');

var merge = _require2.merge;

function doubleCall1() {
  var s1 = call('c1', c1);
  var s2 = call('c2', c2);
  return [s1, s2];
}

function doubleCall2(_ref) {
  var context = _ref.context;

  return setPayload(merge(context.c1.payload, context.c2.payload));
}

function c1() {
  return setPayload({
    c1: true
  });
}

function c2() {
  return setPayload({
    c2: true
  });
}

module.exports = {
  doubleCall: [doubleCall1, doubleCall2]
};
//# sourceMappingURL=double-call.js.map