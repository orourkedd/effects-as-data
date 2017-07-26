'use strict';

var _require = require('../util'),
    errorToJson = _require.errorToJson;

function expectError(e1, e2) {
  var ne1 = typeof e1 === 'string' ? new Error(e1) : e1;
  var ne2 = typeof e2 === 'string' ? new Error(e2) : e2;
  var be1 = get(function () {
    return e2.constructor.name;
  }) ? errorToJson(ne1) : ne1;
  var be2 = get(function () {
    return e1.constructor.name;
  }) ? errorToJson(ne2) : ne2;
  var oe1 = omitStack(be1);
  var oe2 = omitStack(be2);
  expect(oe1).toEqual(oe2);
}

function omitStack(s) {
  delete s.stack;
  return s;
}

function get(fn) {
  try {
    return fn();
  } catch (e) {
    return undefined;
  }
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  expectError: expectError,
  sleep: sleep
};
//# sourceMappingURL=test-util.js.map