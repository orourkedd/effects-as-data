'use strict';

var _marked = [singleLine, yieldArray].map(regeneratorRuntime.mark);

var _require = require('./effects'),
    functions = _require.functions,
    cmds = _require.cmds;

var basic = functions.basic,
    basicMultistep = functions.basicMultistep,
    basicParallel = functions.basicParallel,
    basicMultistepParallel = functions.basicMultistepParallel,
    basicEmpty = functions.basicEmpty,
    basicMultiArg = functions.basicMultiArg,
    eitherTestError = functions.eitherTestError,
    eitherTestEmpty = functions.eitherTestEmpty,
    asyncTest = functions.asyncTest,
    badHandler = functions.badHandler;

var _require2 = require('../test'),
    testFn = _require2.testFn,
    testFnV2 = _require2.testFnV2,
    args = _require2.args;

function singleLine(id) {
  var s1;
  return regeneratorRuntime.wrap(function singleLine$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return cmds.httpGet('http://example.com/api/v1/users/' + id);

        case 2:
          s1 = _context.sent;
          return _context.abrupt('return', s1);

        case 4:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function yieldArray() {
  var s1;
  return regeneratorRuntime.wrap(function yieldArray$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return [{ type: 'test' }];

        case 2:
          s1 = _context2.sent;
          return _context2.abrupt('return', s1);

        case 4:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

var testSingleLine = testFn(singleLine);
var testYieldArray = testFn(yieldArray);

test('testFn should curry', testFn(basic)(function () {
  // prettier-ignore
  return [[['foo'], cmds.echo('foo')], ['foo', 'foo']];
}));

test('testFn should pass (basic)', testFn(basic, function () {
  // prettier-ignore
  return [[['foo'], cmds.echo('foo')], ['foo', 'foo']];
}));

// Basic

test('testFn semantic should pass (basic)', testFn(basic, function () {
  //  prettier-ignore
  return args('foo').yieldCmd(cmds.echo('foo')).yieldReturns('foo').returns('foo');
}));

test('testFnV2 should pass (basic)', testFnV2(basic, function () {
  // prettier-ignore
  return [['foo'], [cmds.echo('foo'), 'foo'], 'foo'];
}));

test('testFn should pass (basicMultiArg)', testFn(basicMultiArg, function () {
  // prettier-ignore
  return [[['foo', 'bar'], cmds.echo('foobar')], ['foobar', 'foobar']];
}));

// Basic w multiple arguments

test('testFn should pass (basicMultiArg)', testFn(basicMultiArg, function () {
  // prettier-ignore
  return [[['foo', 'bar'], cmds.echo('foobar')], ['foobar', 'foobar']];
}));

test('testFn semantic should pass (basicMultiArg)', testFn(basicMultiArg, function () {
  // prettier-ignore
  return args('foo', 'bar').yieldCmd(cmds.echo('foobar')).yieldReturns('foobar').returns('foobar');
}));

test('testFn semantic should pass (basicMultiArg)', testFnV2(basicMultiArg, function () {
  // prettier-ignore
  return [['foo', 'bar'], [cmds.echo('foobar'), 'foobar'], 'foobar'];
}));

//  Basic with multiple steps

test('testFn should pass (basicMultistep)', testFn(basicMultistep, function () {
  // prettier-ignore
  return [[['foo'], cmds.echo('foo1')], ['foo1', cmds.echo('foo2')], ['foo2', { s1: 'foo1', s2: 'foo2' }]];
}));

test('testFn semantic should pass (basicMultistep)', testFn(basicMultistep, function () {
  // prettier-ignore
  return args('foo').yieldCmd(cmds.echo('foo1')).yieldReturns('foo1').yieldCmd(cmds.echo('foo2')).yieldReturns('foo2').returns({ s1: 'foo1', s2: 'foo2' });
}));

test('testFnV2 should pass (basicMultistep)', testFnV2(basicMultistep, function () {
  // prettier-ignore
  return [['foo'], [cmds.echo('foo1'), 'foo1'], [cmds.echo('foo2'), 'foo2'], { s1: 'foo1', s2: 'foo2' }];
}));

// Basic with parallel commands

test('testFn should pass (basicParallel)', testFn(basicParallel, function () {
  var c = [cmds.echo('foo'), cmds.echo('foo')];
  // prettier-ignore
  return [[['foo'], c], [['foo', 'foo'], { s1: 'foo1', s2: 'foo2' }]];
}));

test('testFn semantic should pass (basicParallel)', testFn(basicParallel, function () {
  var c = [cmds.echo('foo'), cmds.echo('foo')];
  // prettier-ignore
  return args('foo').yieldCmd(c).yieldReturns(['foo', 'foo']).returns({ s1: 'foo1', s2: 'foo2' });
}));

test('testFnV2 should pass (basicParallel)', testFnV2(basicParallel, function () {
  var c = [cmds.echo('foo'), cmds.echo('foo')];
  // prettier-ignore
  return [['foo'], [c, ['foo', 'foo']], { s1: 'foo1', s2: 'foo2' }];
}));

//  Basic with multiple steps of parallel commands

test('testFn should pass (basicMultistepParallel)', testFn(basicMultistepParallel, function () {
  var c1 = [cmds.echo('foo'), cmds.echo('foo')];
  var c2 = [cmds.echo('foo'), cmds.echo('foo')];
  // prettier-ignore
  return [[['foo'], c1], [['foo', 'foo'], c2], [['foo', 'foo'], { s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' }]];
}));

test('testFn semantic should pass (basicMultistepParallel)', testFn(basicMultistepParallel, function () {
  var c1 = [cmds.echo('foo'), cmds.echo('foo')];
  var c2 = [cmds.echo('foo'), cmds.echo('foo')];
  // prettier-ignore
  return args('foo').yieldCmd(c1).yieldReturns(['foo', 'foo']).yieldCmd(c2).yieldReturns(['foo', 'foo']).returns({ s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' });
}));

test('testFnV2 should pass (basicMultistepParallel)', testFnV2(basicMultistepParallel, function () {
  var c1 = [cmds.echo('foo'), cmds.echo('foo')];
  var c2 = [cmds.echo('foo'), cmds.echo('foo')];
  // prettier-ignore
  return [['foo'], [c1, ['foo', 'foo']], [c2, ['foo', 'foo']], { s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' }];
}));

//  Basic with empty args

test('testFn should pass (basicEmpty)', testFn(basicEmpty, function () {
  // prettier-ignore
  return [[[null], []], [[], []]];
}));

test('testFn semantic should pass (basicEmpty)', testFn(basicEmpty, function () {
  // prettier-ignore
  return args(null).yieldCmd([]).yieldReturns([]).returns([]);
}));

test('testFnV2 should pass (basicEmpty)', testFnV2(basicEmpty, function () {
  // prettier-ignore
  return [[null], [[], []], []];
}));

// Either test with error

test('testFn should pass (eitherTestError)', testFn(eitherTestError, function () {
  // prettier-ignore
  return [[[null], cmds.either(cmds.die('oops'), 'foo')], ['foo', 'foo']];
}));

test('testFn semantic should pass (eitherTestError)', testFn(eitherTestError, function () {
  // prettier-ignore
  return args(null).yieldCmd(cmds.either(cmds.die('oops'), 'foo')).yieldReturns('foo').returns('foo');
}));

test('testFnV2 semantic should pass (eitherTestError)', testFnV2(eitherTestError, function () {
  // prettier-ignore
  return [[null], [cmds.either(cmds.die('oops'), 'foo'), 'foo'], 'foo'];
}));

//  Handler error handling

test('testFn should handle errors (badHandler)', testFn(badHandler, function () {
  // prettier-ignore
  return [[[null], cmds.die('oops')], [new Error('oops!'), new Error('oops!')]];
}));

test('testFn semantic should handle errors (badHandler)', testFn(badHandler, function () {
  // prettier-ignore
  return args([null]).yieldCmd(cmds.die('oops')).yieldReturns(new Error('oops!')).returns(new Error('oops!'));
}));

test('testFnV2 should handle errors (badHandler)', testFnV2(badHandler, function () {
  // prettier-ignore
  return [[null], [cmds.die('oops'), new Error('oops!')], new Error('oops!')];
}));

// Either test empty

test('testFn should pass (eitherTestEmpty)', testFn(eitherTestEmpty, function () {
  // prettier-ignore
  return [[[null], cmds.either(cmds.echo(null), 'foo')], ['foo', 'foo']];
}));

test('testFn semantic should pass (eitherTestEmpty)', testFn(eitherTestEmpty, function () {
  // prettier-ignore
  return args(null).yieldCmd(cmds.either(cmds.echo(null), 'foo')).yieldReturns('foo').returns('foo');
}));

test('testFnV2 should pass (eitherTestEmpty)', testFnV2(eitherTestEmpty, function () {
  // prettier-ignore
  return [[null], [cmds.either(cmds.echo(null), 'foo'), 'foo'], 'foo'];
}));

//  Async cmd

test('testFn should pass (asyncTest)', testFn(asyncTest, function () {
  // prettier-ignore
  return [[[null], cmds.async({ type: 'test' })], [null, null]];
}));

test('testFn semantic should pass (asyncTest)', testFn(asyncTest, function () {
  // prettier-ignore
  return args(null).yieldCmd(cmds.async({ type: 'test' })).yieldReturns(null).returns(null);
}));

test('testFnV2 should pass (asyncTest)', testFnV2(asyncTest, function () {
  // prettier-ignore
  return [[null], [cmds.async({ type: 'test' }), null], null];
}));

//  Single line

test('single line should pass', testSingleLine(function () {
  //  prettier-ignore
  return [[['123'], cmds.httpGet('http://example.com/api/v1/users/123')], [{ foo: 'bar' }, { foo: 'bar' }]];
}));

test('testFn semantic single line should not fail', testSingleLine(function () {
  // prettier-ignore
  return args('123').yieldCmd(cmds.httpGet('http://example.com/api/v1/users/123')).yieldReturns({ foo: 'bar' }).returns({ foo: 'bar' });
}));

test('testFn should give proper error message if yielding array but no results', function () {
  try {
    testYieldArray(function () {
      //  prettier-ignore
      return [[undefined, [{ type: 'test' }]]];
    })();
  } catch (e) {
    expect(e.message).toEqual('Your spec does not have as many steps as your function.  Are you missing a return line?');
  }
});

test('testFn should give proper error message if spec is returning undefined', function () {
  try {
    testYieldArray(function () {})();
  } catch (e) {
    expect(e.message).toEqual('Your spec must return an array of tuples.  It is currently returning a value of type "undefined".');
  }
});

test('testFn should give proper error message if spec is returning an object', function () {
  try {
    testYieldArray(function () {
      return {};
    })();
  } catch (e) {
    expect(e.message).toEqual('Your spec must return an array of tuples.  It is currently returning a value of type "object".');
  }
});

test('testFn should give proper error message if spec is returning an string', function () {
  try {
    testYieldArray(function () {
      return 'what?';
    })();
  } catch (e) {
    expect(e.message).toEqual('Your spec must return an array of tuples.  It is currently returning a value of type "string".');
  }
});
//# sourceMappingURL=test.spec.js.map