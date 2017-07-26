'use strict';

var _require = require('../index'),
    call = _require.call;

var _require2 = require('./effects'),
    functions = _require2.functions,
    handlers = _require2.handlers;

var async = handlers.async;
var asyncTest = functions.asyncTest;

var _require3 = require('./test-util'),
    sleep = _require3.sleep;

test('async', async function () {
  var called = false;
  var testHandler = function testHandler() {
    called = true;
  };
  await call({}, { async: async, test: testHandler }, asyncTest);
  expect(called).toEqual(false);
  await sleep(50);
  expect(called).toEqual(true);
});
//# sourceMappingURL=async.spec.js.map