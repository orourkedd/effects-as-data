'use strict';

var _require = require('../../actions');

var panic = _require.panic;

function p1() {
  return panic(new Error('Something bad happened!'));
}

module.exports = {
  testPanic: p1
};
//# sourceMappingURL=test-panic.js.map