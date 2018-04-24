const { promisify } = require("../index");
const cmds = require("../cmds");
const { sleep } = require("./test-util");

test("globalVariable() should return a global variable", async () => {
  const testValue = Math.random().toString();
  process.env.testValue = testValue;
  function* testGlobalVariable() {
    const { env } = yield cmds.globalVariable("process");
    return env.testValue;
  }
  const actual = await promisify(testGlobalVariable)();
  expect(actual).toEqual(testValue);
});

test("call() should call an effects-as-data function", async () => {
  function* testCallee(message) {
    return yield cmds.echo(`foo${message}`);
  }
  function* testCall() {
    return yield cmds.call(testCallee, "bar");
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("call() should handle errors", async () => {
  function* testCallee() {
    throw new Error("oops");
  }
  function* testCall() {
    return yield cmds.call(testCallee);
  }
  try {
    await promisify(testCall)();
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  throw new Error("testCall did not throw");
});

test("callFn() should call a promise-returning function", async () => {
  function testCallee(message) {
    return Promise.resolve(`foo${message}`);
  }
  function* testCall() {
    return yield cmds.callFn(testCallee, "bar");
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("callFn() should call a non-promise-returning function", async () => {
  function testCallee(message) {
    return `foo${message}`;
  }
  function* testCall() {
    return yield cmds.callFn(testCallee, "bar");
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("fn() should call a promise-returning function", async () => {
  function testCallee(message) {
    return Promise.resolve(`foo${message}`);
  }
  function* testCall() {
    return yield cmds.fn(testCallee, "bar");
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("callFn() should handle rejected promises", async () => {
  function testCallee() {
    return Promise.reject(new Error("oops"));
  }
  function* testCall() {
    return yield cmds.callFn(testCallee, "bar");
  }
  try {
    await promisify(testCall)();
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  throw new Error("testCall did not reject");
});

test("callFn() should handle errors", async () => {
  function testCallee() {
    throw new Error("oops");
  }
  function* testCall() {
    return yield cmds.callFn(testCallee, "bar");
  }
  try {
    await promisify(testCall)();
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  throw new Error("testCall did not throw");
});

test("callFnBound() should call a function with `this`", async () => {
  const context = {
    message: "bar"
  };
  function testCallee() {
    return Promise.resolve(`foo${this.message}`);
  }
  function* testCall() {
    return yield cmds.callFnBound(context, testCallee);
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("callFnBound() should handle errors", async () => {
  const context = {
    message: "bar"
  };
  function testCallee() {
    throw new Error("oops");
  }
  function* testCall() {
    return yield cmds.callFnBound(context, testCallee);
  }
  try {
    await promisify(testCall)();
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  throw new Error("testCall did not throw");
});

test("callCallback() should call a callback function", async () => {
  function testCallee(message, done) {
    done(null, `foo${message}`);
  }
  function* testCall() {
    return yield cmds.callCallback(testCallee, "bar");
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("callback() should call a callback function", async () => {
  function testCallee(message, done) {
    done(null, `foo${message}`);
  }
  function* testCall() {
    return yield cmds.callback(testCallee, "bar");
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("callCallback() should handle errors", async () => {
  function testCallee(done) {
    done(new Error("oops"));
  }
  function* testCall() {
    return yield cmds.callCallback(testCallee);
  }
  try {
    await promisify(testCall)();
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  throw new Error("testCall did not throw");
});

test("callCallback() should handle thrown errors", async () => {
  function testCallee(done) {
    throw new Error("oops");
  }
  function* testCall() {
    return yield cmds.callCallback(testCallee);
  }
  try {
    await promisify(testCall)();
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  throw new Error("testCall did not throw");
});

test("callCallbackBound() should call a callback function with `this`", async () => {
  const context = {
    message: "bar"
  };
  function testCallee(done) {
    done(null, `foo${this.message}`);
  }
  function* testCall() {
    return yield cmds.callCallbackBound(context, testCallee);
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("callCallbackBound() should handle errors", async () => {
  const context = {
    message: "bar"
  };
  function testCallee(done) {
    done(new Error("oops"));
  }
  function* testCall() {
    return yield cmds.callCallbackBound(context, testCallee);
  }
  try {
    await promisify(testCall)();
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  throw new Error("testCall did not throw");
});

test("callCallbackBound() should handle thrown errors", async () => {
  const context = {
    message: "bar"
  };
  function testCallee(done) {
    throw new Error("oops");
  }
  function* testCall() {
    return yield cmds.callCallbackBound(context, testCallee);
  }
  try {
    await promisify(testCall)();
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  throw new Error("testCall did not throw");
});

test("echo() should return the echoed value", async () => {
  function* testCall() {
    return yield cmds.echo("foobar");
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("noop() should noop", async () => {
  function* testCall() {
    return yield cmds.noop();
  }
  const actual = await promisify(testCall)();
  const expected = undefined;
  expect(actual).toEqual(expected);
});

test("now() should return a timestamp", async () => {
  const now = Date.now();
  function* testCall() {
    return yield cmds.now();
  }
  const actual = await promisify(testCall)();
  expect(actual - now).toBeLessThan(2);
});

test("log() should log to the console", async () => {
  const logOrig = console.log;
  let actual;
  console.log = (...values) => {
    actual = values;
  };
  function* testCall() {
    return yield cmds.log("foo", "bar");
  }
  await promisify(testCall)();
  console.log = logOrig;
  const expected = ["foo", "bar"];
  expect(actual).toEqual(expected);
});

test("logError() should log to the console", async () => {
  const logOrig = console.error;
  let actual;
  console.error = (...values) => {
    actual = values;
  };
  function* testCall() {
    return yield cmds.logError("foo", "bar");
  }
  await promisify(testCall)();
  console.error = logOrig;
  const expected = ["foo", "bar"];
  expect(actual).toEqual(expected);
});

test("sleep() should sleep", async () => {
  const start = Date.now();
  function* testCall() {
    return yield cmds.sleep(100);
  }
  const actual = await promisify(testCall)();
  const end = Date.now();
  expect(end - start).toBeGreaterThanOrEqual(100);
});

test("series() should execute in series", async () => {
  const start = Date.now();
  function* testCall() {
    return yield cmds.series([cmds.sleep(50), cmds.sleep(50), cmds.sleep(50)]);
  }
  const actual = await promisify(testCall)();
  const end = Date.now();
  expect(end - start).toBeGreaterThanOrEqual(150);
});

test("series() should handle an empty list", async () => {
  function* testCall() {
    return yield cmds.series([]);
  }
  const actual = await promisify(testCall)();
  expect(actual).toEqual([]);
});

test("parellel() should execute in parellel", async () => {
  const start = Date.now();
  function* testCall() {
    return yield cmds.parallel([
      cmds.sleep(50),
      cmds.sleep(50),
      cmds.sleep(50)
    ]);
  }
  const actual = await promisify(testCall)();
  const end = Date.now();
  expect(end - start).toBeGreaterThanOrEqual(50);
  expect(end - start).toBeLessThan(60);
});

test("envelope() should return success results in an envelope", async () => {
  function* testCallee(message) {
    return yield cmds.echo(`foo${message}`);
  }
  function* testCall() {
    return yield cmds.envelope(cmds.call(testCallee, "bar"));
  }
  const actual = await promisify(testCall)();
  const expected = { success: true, result: "foobar" };
  expect(actual).toEqual(expected);
});

test("envelope() should return failed results in an envelope", async () => {
  function* testCallee(message) {
    throw new Error("oops");
  }
  function* testCall() {
    return yield cmds.envelope(cmds.call(testCallee, "bar"));
  }
  const actual = await promisify(testCall)();
  expect(actual.success).toEqual(false);
  expect(actual.result.message).toEqual("oops");
});

test("either() should return value on success", async () => {
  function* testCall() {
    return yield cmds.either(cmds.echo("foobar"), null);
  }
  const actual = await promisify(testCall)();
  const expected = "foobar";
  expect(actual).toEqual(expected);
});

test("either() should return default value on error", async () => {
  function* testCallee() {
    throw new Error("oops");
  }
  function* testCall() {
    return yield cmds.either(cmds.call(testCallee), "defaultvalue");
  }
  const actual = await promisify(testCall)();
  const expected = "defaultvalue";
  expect(actual).toEqual(expected);
});

test('setImmediate() should process a command "immediately"', async () => {
  let actual;
  function* testCallee(message) {
    actual = message;
  }
  function* testCall() {
    yield cmds.setImmediate(cmds.call(testCallee, "foobar"));
  }
  await promisify(testCall)();
  expect(actual).toEqual(undefined);
  await sleep(10);
  expect(actual).toEqual("foobar");
});

test("setTimeout() should set a timeout", async () => {
  let actual;
  function* testCallee(message) {
    actual = message;
  }
  function* testCall() {
    yield cmds.setTimeout(cmds.call(testCallee, "foobar"), 10);
  }
  await promisify(testCall)();
  await sleep(5);
  expect(actual).toEqual(undefined);
  await sleep(12);
  expect(actual).toEqual("foobar");
});

test("clearTimeout() should clear a timeout", async () => {
  let actual;
  function* testCallee(message) {
    actual = message;
  }
  function* testCall() {
    const id = yield cmds.setTimeout(cmds.call(testCallee, "foobar"), 10);
    yield cmds.clearTimeout(id);
  }
  await promisify(testCall)();
  await sleep(5);
  expect(actual).toEqual(undefined);
  await sleep(12);
  expect(actual).toEqual(undefined);
});

test("setInterval() should set an interval", async () => {
  let actual = 0;
  let id;
  function* testCallee() {
    actual++;
  }
  function* testCall() {
    id = yield cmds.setInterval(cmds.call(testCallee), 5);
  }
  await promisify(testCall)();
  expect(actual).toEqual(0);
  await sleep(10);
  expect(actual).toBeGreaterThanOrEqual(1);
  await sleep(20);
  expect(actual).toBeGreaterThanOrEqual(3);
  clearInterval(id);
});

test("clearInterval() should set an interval", async () => {
  let actual = 0;
  function* testCallee() {
    actual++;
  }
  function* testCall() {
    const id = yield cmds.setInterval(cmds.call(testCallee), 5);
    yield cmds.clearInterval(id);
  }
  await promisify(testCall)();
  expect(actual).toEqual(0);
  await sleep(10);
  expect(actual).toEqual(0);
  await sleep(20);
  expect(actual).toEqual(0);
});

test("getState()/setState() should get and set state", async () => {
  function* t() {
    yield cmds.clearState();
    yield cmds.setState("lorem1", "ipsum1");
    yield cmds.setState("lorem2", "ipsum2");
    return yield [cmds.getState("lorem1"), cmds.getState("lorem2")];
  }
  const value = await promisify(t)();
  expect(value).toEqual(["ipsum1", "ipsum2"]);
});

test("getState() should return entire state if no key", async () => {
  function* t() {
    yield cmds.clearState();
    yield cmds.setState("dolor", "sit");
    return yield cmds.getState();
  }
  const state = await promisify(t)();
  expect(state).toEqual({ dolor: "sit" });
});

test("getState() should use default value if value is undefined", async () => {
  function* t() {
    yield cmds.clearState();
    return yield cmds.getState("amet", "consectetur");
  }
  const value = await promisify(t)();
  expect(value).toEqual("consectetur");
});

test("clearState() should clear the state", async () => {
  function* t() {
    yield cmds.setState("adipiscing", "elit");
    const state = yield cmds.getState();
    expect(state).toEqual({ adipiscing: "elit" });
    yield cmds.clearState();
    return yield cmds.getState();
  }
  const state = await promisify(t)();
  expect(state).toEqual({});
});
