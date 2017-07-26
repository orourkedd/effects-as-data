'use strict';

var _require = require('../index'),
    call = _require.call;

var _require2 = require('./effects'),
    handlers = _require2.handlers,
    functions = _require2.functions;

var badHandler = functions.badHandler,
    badHandlerRejection = functions.badHandlerRejection,
    valueReturningHandler = functions.valueReturningHandler,
    promiseReturningHandler = functions.promiseReturningHandler;

var _require3 = require('./test-util'),
    expectError = _require3.expectError;

test('handlers should be able to return non-promise values', async function () {
  var actual = await call({}, handlers, valueReturningHandler, 'bar');
  var expected = 'bar';
  expect(actual).toEqual(expected);
});

test('handlers should be able to return promises', async function () {
  var actual = await call({}, handlers, promiseReturningHandler, 'bar');
  var expected = 'bar';
  expect(actual).toEqual(expected);
});

test('call should reject when a handler throws and is not caught', async function () {
  try {
    await call({}, handlers, badHandler);
  } catch (actual) {
    var message = 'oops';
    return expectError(actual, message);
  }
  fail('Function did not reject.');
});

test('call should reject when a handler rejects and is not caught', async function () {
  try {
    await call({}, handlers, badHandlerRejection);
  } catch (actual) {
    var message = 'oops';
    return expectError(actual, message);
  }
  fail('Function did not reject.');
});
//# sourceMappingURL=handlers.spec.js.map