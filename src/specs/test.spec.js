const { functions, cmds } = require("./effects");
const {
  basic,
  basicMultistep,
  basicParallel,
  basicMultistepParallel,
  basicEmpty,
  basicMultiArg,
  eitherTestError,
  eitherTestEmpty,
  asyncTest,
  badHandler
} = functions;
const { testFn, testFnV2, args } = require("../test");
const { deepEqual } = require("./test-util");

function* singleLine(id) {
  const s1 = yield cmds.httpGet(`http://example.com/api/v1/users/${id}`);
  return s1;
}

function* yieldArray() {
  const s1 = yield [{ type: "test" }];
  return s1;
}

const testSingleLine = testFn(singleLine);
const testYieldArray = testFn(yieldArray);

function* rethrow() {
  try {
    return yield cmds.echo("foo");
  } catch (e) {
    throw new Error("bar");
  }
}

test("testFn should fail if tuples[0][0] is not an array", () => {
  try {
    testFn(throwFoo, () => {
      // prettier-ignore
      return [
        [ null, new Error("bar") ]
      ]
    })();
  } catch (e) {
    deepEqual(
      e.message,
      "The first argument of the first tuple must be an array representing the arguments of the function."
    );
    return;
  }
  throw new Error("Failed: Did not compare error messages");
});

function* throwFoo() {
  throw new Error("foo");
}

test("testFn should fail if the function error is different than the test error", () => {
  try {
    testFn(throwFoo, () => {
      // prettier-ignore
      return [
          [ [], new Error("bar") ]
        ]
    })();
  } catch (e) {
    deepEqual(e.name, "Error on Step 1");
    return;
  }
  throw new Error("Failed: Did not compare error messages");
});

test(
  "should be able to rethrow errors",
  testFnV2(rethrow, () => {
    // prettier-ignore
    return [
      [],
      [cmds.echo('foo'), new Error("whatever")],
      new Error("bar")
    ]
  })
);

test(
  "testFn should handle undefined returns for semantic test",
  testFn(function*() {}, () => {
    return args().returns();
  })
);

test(
  "testFn should curry",
  testFn(basic)(() => {
    // prettier-ignore
    return [
      [['foo'], cmds.echo('foo')],
      ['foo', 'foo']
    ]
  })
);

test(
  "testFn should pass (basic)",
  testFn(basic, () => {
    // prettier-ignore
    return [
      [['foo'], cmds.echo('foo')],
      ['foo', 'foo']
    ]
  })
);

// Basic

test(
  "testFn semantic should pass (basic)",
  testFn(basic, () => {
    //  prettier-ignore
    return args('foo')
      .yieldCmd(cmds.echo('foo')).yieldReturns('foo')
      .returns('foo')
  })
);

test(
  "testFnV2 should pass (basic)",
  testFnV2(basic, () => {
    // prettier-ignore
    return [
      ['foo'],
      [cmds.echo('foo'), 'foo'],
      'foo'
    ]
  })
);

test(
  "testFn should pass (basicMultiArg)",
  testFn(basicMultiArg, () => {
    // prettier-ignore
    return [
      [['foo', 'bar'], cmds.echo('foobar')],
      ['foobar', 'foobar']
    ]
  })
);

// Basic w multiple arguments

test(
  "testFn should pass (basicMultiArg)",
  testFn(basicMultiArg, () => {
    // prettier-ignore
    return [
      [['foo', 'bar'], cmds.echo('foobar')],
      ['foobar', 'foobar']
    ]
  })
);

test(
  "testFn semantic should pass (basicMultiArg)",
  testFn(basicMultiArg, () => {
    // prettier-ignore
    return args('foo', 'bar')
      .yieldCmd(cmds.echo('foobar')).yieldReturns('foobar')
      .returns('foobar')
  })
);

test(
  "testFn semantic should pass (basicMultiArg)",
  testFnV2(basicMultiArg, () => {
    // prettier-ignore
    return [
      ['foo', 'bar'],
      [cmds.echo('foobar'), 'foobar'],
      'foobar'
    ]
  })
);

//  Basic with multiple steps

test(
  "testFn should pass (basicMultistep)",
  testFn(basicMultistep, () => {
    // prettier-ignore
    return [
      [['foo'], cmds.echo('foo1')],
      ['foo1', cmds.echo('foo2')],
      ['foo2', { s1: 'foo1', s2: 'foo2' }]
    ]
  })
);

test(
  "testFn semantic should pass (basicMultistep)",
  testFn(basicMultistep, () => {
    // prettier-ignore
    return args('foo')
      .yieldCmd(cmds.echo('foo1')).yieldReturns('foo1')
      .yieldCmd(cmds.echo('foo2')).yieldReturns('foo2')
      .returns({ s1: 'foo1', s2: 'foo2' })
  })
);

test(
  "testFnV2 should pass (basicMultistep)",
  testFnV2(basicMultistep, () => {
    // prettier-ignore
    return [
      ['foo'],
      [cmds.echo('foo1'), 'foo1'],
      [cmds.echo('foo2'), 'foo2'],
      { s1: 'foo1', s2: 'foo2' }
    ]
  })
);

// Basic with parallel commands

test(
  "testFn should pass (basicParallel)",
  testFn(basicParallel, () => {
    const c = [cmds.echo("foo"), cmds.echo("foo")];
    // prettier-ignore
    return [
      [['foo'], c],
      [['foo', 'foo'], { s1: 'foo1', s2: 'foo2' }]
    ]
  })
);

test(
  "testFn semantic should pass (basicParallel)",
  testFn(basicParallel, () => {
    const c = [cmds.echo("foo"), cmds.echo("foo")];
    // prettier-ignore
    return args('foo')
      .yieldCmd(c).yieldReturns(['foo', 'foo'])
      .returns({ s1: 'foo1', s2: 'foo2' })
  })
);

test(
  "testFnV2 should pass (basicParallel)",
  testFnV2(basicParallel, () => {
    const c = [cmds.echo("foo"), cmds.echo("foo")];
    // prettier-ignore
    return [
      ['foo'],
      [c, ['foo', 'foo']],
      { s1: 'foo1', s2: 'foo2' }
    ]
  })
);

//  Basic with multiple steps of parallel commands

test(
  "testFn should pass (basicMultistepParallel)",
  testFn(basicMultistepParallel, () => {
    const c1 = [cmds.echo("foo"), cmds.echo("foo")];
    const c2 = [cmds.echo("foo"), cmds.echo("foo")];
    // prettier-ignore
    return [
      [['foo'], c1],
      [['foo', 'foo'], c2],
      [['foo', 'foo'], { s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' }]
    ]
  })
);

test(
  "testFn semantic should pass (basicMultistepParallel)",
  testFn(basicMultistepParallel, () => {
    const c1 = [cmds.echo("foo"), cmds.echo("foo")];
    const c2 = [cmds.echo("foo"), cmds.echo("foo")];
    // prettier-ignore
    return args('foo')
      .yieldCmd(c1).yieldReturns(['foo', 'foo'])
      .yieldCmd(c2).yieldReturns(['foo', 'foo'])
      .returns({ s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' })
  })
);

test(
  "testFnV2 should pass (basicMultistepParallel)",
  testFnV2(basicMultistepParallel, () => {
    const c1 = [cmds.echo("foo"), cmds.echo("foo")];
    const c2 = [cmds.echo("foo"), cmds.echo("foo")];
    // prettier-ignore
    return [
      ['foo'],
      [c1, ['foo', 'foo']],
      [c2, ['foo', 'foo']],
      { s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' }
    ]
  })
);

//  Basic with empty args

test(
  "testFn should pass (basicEmpty)",
  testFn(basicEmpty, () => {
    // prettier-ignore
    return [
      [[null], []],
      [[], []]
    ]
  })
);

test(
  "testFn semantic should pass (basicEmpty)",
  testFn(basicEmpty, () => {
    // prettier-ignore
    return args(null)
      .yieldCmd([]).yieldReturns([])
      .returns([])
  })
);

test(
  "testFnV2 should pass (basicEmpty)",
  testFnV2(basicEmpty, () => {
    // prettier-ignore
    return [
      [null],
      [[], []],
      []
    ]
  })
);

// Either test with error

test(
  "testFn should pass (eitherTestError)",
  testFn(eitherTestError, () => {
    // prettier-ignore
    return [
      [[null], cmds.either(cmds.die('oops'), 'foo')],
      ['foo', 'foo']
    ]
  })
);

test(
  "testFn semantic should pass (eitherTestError)",
  testFn(eitherTestError, () => {
    // prettier-ignore
    return args(null)
      .yieldCmd(cmds.either(cmds.die('oops'), 'foo')).yieldReturns('foo')
      .returns('foo')
  })
);

test(
  "testFnV2 semantic should pass (eitherTestError)",
  testFnV2(eitherTestError, () => {
    // prettier-ignore
    return [
      [null],
      [cmds.either(cmds.die('oops'), 'foo'), 'foo'],
      'foo'
    ]
  })
);

//  Handler error handling

test(
  "testFn should handle errors (badHandler)",
  testFn(badHandler, () => {
    // prettier-ignore
    return [
      [[null], cmds.die('oops')],
      [new Error('oops!'), new Error('oops!')]
    ]
  })
);

test(
  "testFn semantic should handle errors (badHandler)",
  testFn(badHandler, () => {
    // prettier-ignore
    return args([null])
      .yieldCmd(cmds.die('oops')).yieldReturns(new Error('oops!'))
      .returns(new Error('oops!'))
  })
);

test(
  "testFn semantic should handle errors using yieldThrows and throws (badHandler)",
  testFn(badHandler, () => {
    // prettier-ignore
    return args([null])
      .yieldCmd(cmds.die('oops')).yieldThrows(new Error('oops!'))
      .throws(new Error('oops!'))
  })
);

function* throwImmediately() {
  throw new Error("oops!");
}

test(
  "testFn semantic should handle errors thrown immediately",
  testFn(throwImmediately, () => {
    // prettier-ignore
    return args()
      .throws(new Error('oops!'))
  })
);

test(
  "testFn semantic should handle errors without returns (badHandler)",
  testFn(badHandler, () => {
    // prettier-ignore
    return args([null])
      .yieldCmd(cmds.die('oops')).throws(new Error('oops!'))
  })
);

test(
  "testFnV2 should handle errors (badHandler)",
  testFnV2(badHandler, () => {
    // prettier-ignore
    return [
      [null],
      [cmds.die('oops'), new Error('oops!')],
      new Error('oops!')
    ]
  })
);

// Either test empty

test(
  "testFn should pass (eitherTestEmpty)",
  testFn(eitherTestEmpty, () => {
    // prettier-ignore
    return [
      [[null], cmds.either(cmds.echo(null), 'foo')],
      ['foo', 'foo']
    ]
  })
);

test(
  "testFn semantic should pass (eitherTestEmpty)",
  testFn(eitherTestEmpty, () => {
    // prettier-ignore
    return args(null)
      .yieldCmd(cmds.either(cmds.echo(null), 'foo')).yieldReturns('foo')
      .returns('foo')
  })
);

test(
  "testFnV2 should pass (eitherTestEmpty)",
  testFnV2(eitherTestEmpty, () => {
    // prettier-ignore
    return [
      [null],
      [cmds.either(cmds.echo(null), 'foo'), 'foo'],
      'foo'
    ]
  })
);

//  Async cmd

test(
  "testFn should pass (asyncTest)",
  testFn(asyncTest, () => {
    // prettier-ignore
    return [
      [[null], cmds.async({ type: 'test' })],
      [null, null]
    ]
  })
);

test(
  "testFn semantic should pass (asyncTest)",
  testFn(asyncTest, () => {
    // prettier-ignore
    return args(null)
      .yieldCmd(cmds.async({ type: 'test' })).yieldReturns(null)
      .returns(null)
  })
);

test(
  "testFnV2 should pass (asyncTest)",
  testFnV2(asyncTest, () => {
    // prettier-ignore
    return [
      [null],
      [cmds.async({ type: 'test' }), null],
      null
    ]
  })
);

// Return cmd result
//  Throw from semantic test builder

function* returnCmdResult() {
  return yield cmds.echo("foo");
}

test(
  "testFn semantic should return cmd result",
  testFn(returnCmdResult, () => {
    //  prettier-ignore
    return args()
      .yieldCmd(cmds.echo('foo')).returns("foo")
  })
);

//  Throw from semantic test builder

function* throwSemantic() {
  const value = yield cmds.echo("foo");
  throw new Error("oops");
}

test(
  "testFn semantic should throw if .throws is used",
  testFn(throwSemantic, () => {
    //  prettier-ignore
    return args()
      .yieldCmd(cmds.echo('foo')).yieldReturns('foo')
      .throws(new Error("oops"))
  })
);

test("testFn should throw proper error if function throws incorrect error", () => {
  try {
    testFn(throwSemantic, () => {
      //  prettier-ignore
      return args()
        .yieldCmd(cmds.echo('foo')).yieldReturns('foo')
        .throws(new Error("wrong"))
    })();
  } catch (e) {
    deepEqual(e.name, "Error on Step 2");
    return;
  }
  throw new Error("Failed: Did not throw");
});

//  Single line

test(
  "single line should pass",
  testSingleLine(() => {
    //  prettier-ignore
    return [
      [['123'], cmds.httpGet('http://example.com/api/v1/users/123')],
      [{ foo: 'bar' }, { foo: 'bar' }]
    ]
  })
);

test(
  "testFn semantic single line should not fail",
  testSingleLine(() => {
    // prettier-ignore
    return args('123')
      .yieldCmd(cmds.httpGet('http://example.com/api/v1/users/123')).yieldReturns({ foo: 'bar' })
      .returns({ foo: 'bar' })
  })
);

test("testFn should give proper error message if yielding array but no results", () => {
  try {
    testYieldArray(() => {
      //  prettier-ignore
      return [
        [[], [{ type: 'test' }]]
      ]
    })();
  } catch (e) {
    deepEqual(
      e.message,
      "Your spec does not have as many steps as your function.  Are you missing a return line?"
    );
  }
});

test("testFn should give proper error message if spec is returning undefined", () => {
  try {
    testYieldArray(() => {})();
  } catch (e) {
    deepEqual(
      e.message,
      'Your spec must return an array of tuples.  It is currently returning a value of type "undefined".'
    );
  }
});

test("testFn should give proper error message if spec is returning an object", () => {
  try {
    testYieldArray(() => {
      return {};
    })();
  } catch (e) {
    deepEqual(
      e.message,
      'Your spec must return an array of tuples.  It is currently returning a value of type "object".'
    );
  }
});

test("testFn should give proper error message if spec is returning an string", () => {
  try {
    testYieldArray(() => {
      return "what?";
    })();
  } catch (e) {
    deepEqual(
      e.message,
      'Your spec must return an array of tuples.  It is currently returning a value of type "string".'
    );
  }
});
