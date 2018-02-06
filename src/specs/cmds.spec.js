const {
  call,
  callFn,
  callFnBound,
  callCallback,
  callCallbackBound,
  echo,
  globalVariable
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

test("callFn should return a callFn cmd", () => {
  const fn = function() {};
  const actual = callFn(fn, "foo", "bar");
  const expected = {
    type: "callFn",
    fn,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.fn === callFn", () => {
  expect(call.fn).toEqual(callFn);
});

test("callFnBound should return a callFnBound cmd", () => {
  const fn = function() {};
  const bindThis = {};
  const actual = callFnBound(bindThis, fn, "foo", "bar");
  const expected = {
    type: "callFn",
    fn,
    bindThis,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.fnBound === callFnBound", () => {
  expect(call.fnBound).toEqual(callFnBound);
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

test("globalVariable()", () => {
  expect(globalVariable("process")).toEqual({
    type: "globalVariable",
    name: "process"
  });
});
