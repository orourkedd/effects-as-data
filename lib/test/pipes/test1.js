'use strict';

var _require = require('../plugins/test1');

var test1 = _require.test1;

var _require2 = require('../../actions');

var setPayload = _require2.setPayload;

function t1() {
  return test1('result');
}

function t2(_ref) {
  var context = _ref.context;

  return setPayload({
    result: context.result
  });
}

module.exports = {
  test1Pipe: [t1, t2]
};
//# sourceMappingURL=test1.js.map