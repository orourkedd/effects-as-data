const {
  promisify,
  call,
  doCmd,
  setContext,
  getContext,
  addToContext,
  setInterpreters,
  getInterpreters,
  addInterpreters,
  reset,
  onError,
  effect,
  cmds,
  interpreters
} = require("../index");

test("promisify should tag function", () => {
  function* test1(message) {
    return yield cmds.echo(message);
  }
  expect(promisify(test1).eadPromisified).toEqual(true);
});

test("promisify should name function", () => {
  function* testName(message) {
    return yield cmds.echo(message);
  }
  expect(promisify(testName).name).toEqual("testName");
});

test("promisify should not double wrap", () => {
  function* test1(message) {
    return yield cmds.echo(message);
  }
  const p = promisify(test1);
  expect(p).toEqual(promisify(p));
});

test("promisify should wrap up an effects-as-data function", async () => {
  function* test1(message) {
    return yield cmds.echo(message);
  }

  const result = await promisify(test1)("foo");
  expect(result).toEqual("foo");
});

test("promisify should handle errors", async () => {
  function* test1(message) {
    throw new Error("oops");
  }

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("call should call a function", async () => {
  function* test1(message) {
    return yield cmds.echo(message);
  }

  const result = await call(test1, "foo");
  expect(result).toEqual("foo");
});

test("doCmd should process a command", async () => {
  const result = await doCmd(cmds.echo("foo"));
  expect(result).toEqual("foo");
});

test("cmds.call should call effects-as-data function", async () => {
  function* test1(message) {
    return yield cmds.call(test2, message);
  }

  function* test2(message) {
    return yield cmds.echo(message);
  }

  const result = await promisify(test1)("foo");
  expect(result).toEqual("foo");
});

test("[error handling] cmds.call should call effects-as-data function", async () => {
  function* test1(message) {
    return yield cmds.call(test2, message);
  }

  function* test2(message) {
    throw new Error("oops");
  }

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("cmds.call should call promisified function", async () => {
  function* test1(message) {
    return yield cmds.call(test2, message);
  }

  const test2 = promisify(function*(message) {
    return yield cmds.echo(message);
  });

  const result = await promisify(test1)("foo");
  expect(result).toEqual("foo");
});

test("[error handling] cmds.call should call promisified function", async () => {
  function* test1(message) {
    return yield cmds.call(test2, message);
  }

  const test2 = promisify(function*(message) {
    throw new Error("oops");
  });

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("cmds.call.fn should call promisified function", async () => {
  function* test1(message) {
    return yield cmds.call.fn(test2, message);
  }

  const test2 = promisify(function*(message) {
    return yield cmds.echo(message);
  });

  const result = await promisify(test1)("foo");
  expect(result).toEqual("foo");
});

test("[error handling] cmds.call.fn should call promisified function", async () => {
  function* test1(message) {
    return yield cmds.call.fn(test2, message);
  }

  const test2 = promisify(function*(message) {
    throw new Error("oops");
  });

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("cmds.call.fn should call promise returning function", async () => {
  function* test1(message) {
    return yield cmds.call.fn(test2, message);
  }

  function test2(message) {
    return Promise.resolve(message);
  }

  const result = await promisify(test1)("foo");
  expect(result).toEqual("foo");
});

test("[error handling] cmds.call.fn should call promise returning function", async () => {
  function* test1(message) {
    return yield cmds.call.fn(test2, message);
  }

  function test2(message) {
    throw new Error("oops");
  }

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("cmds.call.fnBound should call promise returning function", async () => {
  function* test1(message) {
    return yield cmds.call.fnBound(obj, obj.test2, message);
  }

  const obj = {
    value: "bar",
    test2(message) {
      return Promise.resolve(`${message}${this.value}`);
    }
  };

  const result = await promisify(test1)("foo");
  expect(result).toEqual("foobar");
});

test("[error handling] cmds.call.fnBound should call promise returning function", async () => {
  function* test1(message) {
    return yield cmds.call.fnBound(obj, obj.test2, message);
  }

  const obj = {
    value: "bar",
    test2(message) {
      throw new Error("oops");
    }
  };

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("cmds.call.callback should call callback function", async () => {
  function* test1(message) {
    return yield cmds.call.callback(test2, message);
  }

  function test2(message, done) {
    done(null, message);
  }

  const result = await promisify(test1)("foo");
  expect(result).toEqual("foo");
});

test("[error handling] cmds.call.callback should call callback function", async () => {
  function* test1(message) {
    return yield cmds.call.callback(test2, message);
  }

  function test2(message, done) {
    done(new Error("oops"), message);
  }

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("[error handling 2] cmds.call.callback should call callback function", async () => {
  function* test1(message) {
    return yield cmds.call.callback(test2, message);
  }

  function test2(message, done) {
    throw new Error("oops");
  }

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("cmds.call.callbackBound should call callback function", async () => {
  function* test1(message) {
    return yield cmds.call.callbackBound(obj, obj.test2, message);
  }

  const obj = {
    value: "bar",
    test2(message, done) {
      done(null, `${message}${this.value}`);
    }
  };

  const result = await promisify(test1)("foo");
  expect(result).toEqual("foobar");
});

test("[error handling] cmds.call.callbackBound should call callback function", async () => {
  function* test1(message) {
    return yield cmds.call.callbackBound(obj, obj.test2, message);
  }

  const obj = {
    value: "bar",
    test2(message, done) {
      done(new Error("oops"), `${message}${this.value}`);
    }
  };

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("[error handling] cmds.call.callbackBound should call callback function", async () => {
  function* test1(message) {
    return yield cmds.call.callbackBound(obj, obj.test2, message);
  }

  const obj = {
    value: "bar",
    test2(message, done) {
      throw new Error("oops");
    }
  };

  try {
    await promisify(test1)("foo");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("promisify did not reject");
});

test("promisify(fn).callWithContext({...}) should call function with context patch", async () => {
  setContext({ configProperty: "foo" });
  // Interpreter
  function testEffect(cmd, { context }) {
    return context.configProperty;
  }

  addInterpreters({ testEffect });

  function* test1(message) {
    const result = yield { type: "testEffect" };
    return `${result}${message}`;
  }

  const result1 = await promisify(test1)("bar");
  expect(result1).toEqual("foobar");

  const result2 = await promisify(test1).callWithContext(
    {
      configProperty: "bar"
    },
    "bar"
  );
  expect(result2).toEqual("barbar");
});

test("promisify(fn).callWithContext({...}) should call function with context patch and call validator", async () => {
  setContext({ configProperty: "foo" });
  // Interpreter
  function testEffect(cmd, { context }) {
    return context.configProperty;
  }

  addInterpreters({ testEffect });

  function* test1(message) {
    const result = yield { type: "testEffect" };
    return `${result}${message}`;
  }

  test1.validator = () => {
    throw new Error("not valid");
  };

  try {
    await promisify(test1).callWithContext(
      {
        configProperty: "bar"
      },
      "bar"
    );
  } catch (e) {
    expect(e.message).toEqual("not valid");
    return;
  }
  fail("did not throw");
});

test("addInterpreters(), getInterpreters(), setInterpreters()", () => {
  reset();

  function testEffect1() {
    return "test1";
  }

  function testEffect2() {
    return "test2";
  }

  expect(getInterpreters()).toEqual({});

  addInterpreters({ testEffect1 });
  expect(getInterpreters()).toEqual({ testEffect1 });

  addInterpreters({ testEffect2 });
  expect(getInterpreters()).toEqual({ testEffect1, testEffect2 });

  setInterpreters({});
  expect(getInterpreters()).toEqual({});
});

test("addToContext(), getContext(), setContext()", () => {
  reset();

  expect(getContext()).toEqual({});

  addToContext({ test1: "foo" });
  expect(getContext()).toEqual({ test1: "foo" });

  addToContext({ test2: "bar" });
  expect(getContext()).toEqual({ test1: "foo", test2: "bar" });

  setContext({});
  expect(getContext()).toEqual({});
});

test("onError() should register error handler on context", () => {
  const handler = () => {};
  onError(handler);
  const context = getContext();
  expect(context.onError).toEqual(handler);
});

test("onError() should throw if handler is not a function", () => {
  expect(onError).toThrow("onError requires a function");
});

test("effect() should return a call cmd", () => {
  const fn = () => {};
  const actual = effect(fn)("foo", "bar");
  const expected = cmds.call.fn(fn, "foo", "bar");
  expect(actual).toEqual(expected);
});

test("effect() should call function", async () => {
  addInterpreters(interpreters);
  const eadFn = effect(m => m);

  const result = await promisify(function*() {
    return yield eadFn("foo");
  })();

  expect(result).toEqual("foo");
});

test("effect() should call validator, if present", () => {
  addInterpreters(interpreters);
  const validator = () => {
    throw new Error("required");
  };
  const eadFn = effect(m => m, validator);

  expect(eadFn).toThrow("required");
});

test("effect() should throw if validator is not a function", () => {
  addInterpreters(interpreters);
  const validator = 0; // validator is not a function
  expect(() => effect(m => m, validator)).toThrow(
    "validator must be a function"
  );
});
