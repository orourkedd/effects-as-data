'use strict';

var _require = require('../index'),
    call = _require.call;

var _require2 = require('./effects'),
    handlers = _require2.handlers,
    functions = _require2.functions;

var basic = functions.basic,
    basicMultistep = functions.basicMultistep,
    basicParallel = functions.basicParallel,
    basicMultistepParallel = functions.basicMultistepParallel,
    basicEmpty = functions.basicEmpty,
    basicMultiArg = functions.basicMultiArg;


test('basic', async function () {
  var expected = 'foo';
  var actual = await call({}, handlers, basic, expected);
  expect(actual).toEqual(expected);
});

test('basic should be able to accept array arguments', async function () {
  var expected = ['foo', 'bar'];
  var actual = await call({}, handlers, basic, expected);
  expect(actual).toEqual(expected);
});

test('basicMultiArg', async function () {
  var actual = await call({}, handlers, basicMultiArg, 'foo', 'bar');
  expect(actual).toEqual('foobar');
});

test('basicMultistep', async function () {
  var actual = await call({}, handlers, basicMultistep, 'foo');
  var expected = { s1: 'foo1', s2: 'foo2' };
  expect(actual).toEqual(expected);
});

test('basicParallel', async function () {
  var actual = await call({}, handlers, basicParallel, 'foo');
  var expected = { s1: 'foo1', s2: 'foo2' };
  expect(actual).toEqual(expected);
});

test('basicMultistepParallel', async function () {
  var actual = await call({}, handlers, basicMultistepParallel, 'foo');
  var expected = { s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' };
  expect(actual).toEqual(expected);
});

test('basicEmpty', async function () {
  var expected = [];
  var actual = await call({}, handlers, basicEmpty);
  expect(actual).toEqual(expected);
});
//# sourceMappingURL=basic.spec.js.map