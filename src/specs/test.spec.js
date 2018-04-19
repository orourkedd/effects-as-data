const { functions, cmds } = require("./common");
const {
  basic,
  basicMultistep,
  basicParallel,
  basicMultistepParallel,
  basicEmpty,
  basicMultiArg,
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
    deepEqual(e.stack.includes("Error on Step 1"), true);
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
    // prettier-ignore
    return args('foo')
      .cmd(cmds.echo('foo'))
        .result('foo')
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
      .cmd(cmds.echo('foobar'))
        .result('foobar')
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

// Basic with multiple steps

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
      .cmd(cmds.echo('foo1'))
        .result('foo1')
      .cmd(cmds.echo('foo2'))
        .result('foo2')
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
      .cmd(c)
        .result(['foo', 'foo'])
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

// Basic with multiple steps of parallel commands

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
      .cmd(c1)
        .result(['foo', 'foo'])
      .cmd(c2)
        .result(['foo', 'foo'])
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

// Basic with empty args

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
      .cmd([])
        .result([])
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

// Handler error handling

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
      .cmd(cmds.die('oops'))
        .result(new Error('oops!'))
      .returns(new Error('oops!'))
  })
);

test(
  "testFn semantic should handle errors using handlerThrows and throws (badHandler)",
  testFn(badHandler, () => {
    // prettier-ignore
    return args([null])
      .cmd(cmds.die('oops'))
        .handlerThrows(new Error('oops!'))
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
      .cmd(cmds.die('oops')).throws(new Error('oops!'))
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

// Return cmd result
// Throw from semantic test builder

function* returnCmdResult() {
  return yield cmds.echo("foo");
}

test(
  "testFn semantic should return cmd result",
  testFn(returnCmdResult, () => {
    // prettier-ignore
    return args()
      .cmd(cmds.echo('foo')).returns("foo")
  })
);

// Throw from semantic test builder

function* throwSemantic() {
  const value = yield cmds.echo("foo");
  throw new Error("oops");
}

test(
  "testFn semantic should throw if .throws is used",
  testFn(throwSemantic, () => {
    // prettier-ignore
    return args()
      .cmd(cmds.echo('foo'))
        .result('foo')
      .throws(new Error("oops"))
  })
);

test("testFn should throw proper error if function throws incorrect error", () => {
  try {
    testFn(throwSemantic, () => {
      // prettier-ignore
      return args()
        .cmd(cmds.echo('foo'))
          .result('foo')
        .throws(new Error("wrong"))
    })();
  } catch (e) {
    deepEqual(e.stack.includes("Error on Step 2"), true);
    return;
  }
  throw new Error("Failed: Did not throw");
});

// Single line

test(
  "single line should pass",
  testSingleLine(() => {
    // prettier-ignore
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
      .cmd(cmds.httpGet('http://example.com/api/v1/users/123'))
        .result({ foo: 'bar' })
      .returns({ foo: 'bar' })
  })
);

test("testFn should give proper error message if yielding array but no results", () => {
  try {
    testYieldArray(() => {
      // prettier-ignore
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
