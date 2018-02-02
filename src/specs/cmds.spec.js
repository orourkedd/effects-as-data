const {
  call,
  callPromise,
  callPromiseBound,
  callCallback,
  callCallbackBound,
  echo
} = require("../cmds");
const { promisify } = require("../index");

test("call should return a call cmd", () => {
  const fn = function*() {};
  const actual = call(fn, "foo", "bar");
  const expected = {
    type: "call",
    fn,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call should run validator", () => {
  const fn = function*() {};
  fn.validator = () => {
    throw new Error("oops");
  };
  try {
    call(fn, "foo", "bar");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("call did not throw");
});

test("call should run validator on promisified function", () => {
  const fn = function*() {};
  fn.validator = () => {
    throw new Error("oops");
  };
  try {
    call(promisify(fn), "foo", "bar");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("call did not throw");
});

test("callPromise should return a callPromise cmd", () => {
  const fn = function() {};
  const actual = callPromise(fn, "foo", "bar");
  const expected = {
    type: "callPromise",
    fn,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.promise === callPromise", () => {
  expect(call.promise).toEqual(callPromise);
});

test("callPromiseBound should return a callPromiseBound cmd", () => {
  const fn = function() {};
  const bindThis = {};
  const actual = callPromiseBound(bindThis, fn, "foo", "bar");
  const expected = {
    type: "callPromise",
    fn,
    bindThis,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.promiseBound === callPromiseBound", () => {
  expect(call.promiseBound).toEqual(callPromiseBound);
});

test("callCallback should return a callCallback cmd", () => {
  const fn = function() {};
  const bindThis = {};
  const actual = callCallback(fn, "foo", "bar");
  const expected = {
    type: "callCallback",
    fn,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.callback === callCallback", () => {
  expect(call.callback).toEqual(callCallback);
});

test("callCallbackBound should return a callCallbackBound cmd", () => {
  const fn = function() {};
  const bindThis = {};
  const actual = callCallbackBound(bindThis, fn, "foo", "bar");
  const expected = {
    type: "callCallback",
    fn,
    bindThis,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.callbackBound === callCallbackBound", () => {
  expect(call.callbackBound).toEqual(callCallbackBound);
});

test("echo()", () => {
  expect(echo("foo")).toEqual({ type: "echo", message: "foo" });
});
