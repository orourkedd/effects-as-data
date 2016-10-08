'use strict';

var _require = require('../../actions');

var end = _require.end;
var setPayload = _require.setPayload;

function one() {
  return setPayload(1);
}

function two() {
  return [setPayload(2), end()];
}

function three() {
  return setPayload(3);
}

module.exports = {
  testEnd: [one, two, three]
};
//# sourceMappingURL=test-end.js.map