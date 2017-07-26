'use strict';

var _require = require('../index'),
    call = _require.call;

var _require2 = require('./effects'),
    handlers = _require2.handlers,
    functions = _require2.functions;

var eitherTestError = functions.eitherTestError,
    eitherTestEmpty = functions.eitherTestEmpty;


test('call should use either, handle error, and return default value', async function () {
  var actual = await call({}, handlers, eitherTestError);
  var expected = 'foo';
  expect(actual).toEqual(expected);
});

test('call should use either, handle error, and return default value if return value is falsey', async function () {
  var actual = await call({}, handlers, eitherTestEmpty);
  var expected = 'foo';
  expect(actual).toEqual(expected);
});
//# sourceMappingURL=either.spec.js.map