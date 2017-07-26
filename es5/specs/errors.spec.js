'use strict';

var _require = require('../index'),
    call = _require.call;

var _require2 = require('./effects'),
    handlers = _require2.handlers,
    functions = _require2.functions;

var badHandler = functions.badHandler,
    throwAtYield = functions.throwAtYield,
    throwAtYieldRecovery = functions.throwAtYieldRecovery,
    functionErrorTest = functions.functionErrorTest;

var _require3 = require('./test-util'),
    expectError = _require3.expectError;

test('call should reject for an undefined function', async function () {
  try {
    await call({}, handlers, undefined);
  } catch (actual) {
    var message = 'A function is required. Perhaps your function is undefined?';
    return expectError(actual, message);
  }
  fail('Function did not reject.');
});

test('call should catch function errors', async function () {
  try {
    await call({}, handlers, functionErrorTest);
  } catch (actual) {
    var message = 'oops!';
    return expectError(actual, message);
  }
  fail('Function did not reject.');
});

test('call should throw error at the yield', async function () {
  var actual = await call({}, handlers, throwAtYield);
  var expected = 'caught!';
  expect(actual).toEqual(expected);
});

test('call should throw error at the yield and recover', async function () {
  var actual = await call({}, handlers, throwAtYieldRecovery);
  var expected = 'foo';
  expect(actual).toEqual(expected);
});
//# sourceMappingURL=errors.spec.js.map