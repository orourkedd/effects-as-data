const cmds = require("../cmds");
const { promisify } = require("../index");

test("call should return a call cmd", () => {
  const fn = function*() {};
  const actual = cmds.call(fn, "foo", "bar");
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
    cmds.call(fn, "foo", "bar");
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
    cmds.call(promisify(fn), "foo", "bar");
  } catch (e) {
    expect(e.message).toEqual("oops");
    return;
  }
  fail("call did not throw");
});

test("callFn should return a callFn cmd", () => {
  const fn = function() {};
  const actual = cmds.callFn(fn, "foo", "bar");
  const expected = {
    type: "callFn",
    fn,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.fn === callFn", () => {
  expect(cmds.call.fn).toEqual(cmds.callFn);
});

test("callFnBound should return a callFnBound cmd", () => {
  const fn = function() {};
  const bindThis = {};
  const actual = cmds.callFnBound(bindThis, fn, "foo", "bar");
  const expected = {
    type: "callFn",
    fn,
    bindThis,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.fnBound === callFnBound", () => {
  expect(cmds.call.fnBound).toEqual(cmds.callFnBound);
});

test("callCallback should return a callCallback cmd", () => {
  const fn = function() {};
  const bindThis = {};
  const actual = cmds.callCallback(fn, "foo", "bar");
  const expected = {
    type: "callCallback",
    fn,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.callback === callCallback", () => {
  expect(cmds.call.callback).toEqual(cmds.callCallback);
});

test("callCallbackBound should return a callCallbackBound cmd", () => {
  const fn = function() {};
  const bindThis = {};
  const actual = cmds.callCallbackBound(bindThis, fn, "foo", "bar");
  const expected = {
    type: "callCallback",
    fn,
    bindThis,
    args: ["foo", "bar"]
  };
  expect(actual).toEqual(expected);
});

test("call.callbackBound === callCallbackBound", () => {
  expect(cmds.call.callbackBound).toEqual(cmds.callCallbackBound);
});

test("echo()", () => {
  expect(cmds.echo("foo")).toEqual({ type: "echo", message: "foo" });
});

test("globalVariable()", () => {
  expect(cmds.globalVariable("process")).toEqual({
    type: "globalVariable",
    name: "process"
  });
});
