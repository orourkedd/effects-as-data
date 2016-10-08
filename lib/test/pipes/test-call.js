'use strict';

var _require = require('../../actions/call');

var call = _require.call;

var _require2 = require('../../actions/set-payload');

var setPayload = _require2.setPayload;

var _require3 = require('ramda');

var merge = _require3.merge;

function mainPipeA(_ref) {
  var payload = _ref.payload;

  return call('subPipe1', subPipe1, payload);
}

function mainPipeB(_ref2) {
  var context = _ref2.context;

  var state = context.subPipe1;
  return setPayload(state.payload);
}

function subPipe1A(_ref3) {
  var payload = _ref3.payload;

  return call('subPipe2', subPipe2, payload);
}

function subPipe1B(_ref4) {
  var context = _ref4.context;

  var state = context.subPipe2;
  return setPayload(state.payload);
}

function subPipe2A(_ref5) {
  var payload = _ref5.payload;

  var newPayload = merge(payload, {
    sub: 'pipe'
  });
  return setPayload(newPayload);
}

var testCall = [mainPipeA, mainPipeB];
var subPipe1 = [subPipe1A, subPipe1B];
var subPipe2 = [subPipe2A];

module.exports = {
  testCall: testCall,
  subPipe1: subPipe1,
  subPipe2: subPipe2
};
//# sourceMappingURL=test-call.js.map