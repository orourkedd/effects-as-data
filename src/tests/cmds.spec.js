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

test("now()", () => {
  expect(cmds.now()).toEqual({ type: "now" });
});

test("log()", () => {
  expect(cmds.log("foo", "bar")).toEqual({ type: "log", args: ["foo", "bar"] });
});

test("logError()", () => {
  expect(cmds.logError("foo", "bar")).toEqual({
    type: "logError",
    args: ["foo", "bar"]
  });
});

test("setImmediate()", () => {
  const cmd = cmds.now();
  expect(cmds.setImmediate(cmd)).toEqual({ type: "setImmediate", cmd });
});

test("setTimeout()", () => {
  const cmd = cmds.now();
  expect(cmds.setTimeout(cmd, 1000)).toEqual({
    type: "setTimeout",
    cmd,
    time: 1000
  });
});

test("clearTimeout()", () => {
  const id = 123;
  expect(cmds.clearTimeout(id)).toEqual({
    type: "clearTimeout",
    id
  });
});

test("setInterval()", () => {
  const cmd = cmds.now();
  expect(cmds.setInterval(cmd, 1000)).toEqual({
    type: "setInterval",
    cmd,
    time: 1000
  });
});

test("clearInterval()", () => {
  const id = 123;
  expect(cmds.clearInterval(id)).toEqual({
    type: "clearInterval",
    id
  });
});

test("sleep()", () => {
  expect(cmds.sleep(1000)).toEqual({ type: "sleep", time: 1000 });
});

test("series()", () => {
  const cmdList = [];
  expect(cmds.series(cmdList)).toEqual({ type: "series", cmdList });
});

test("series() with delay", () => {
  const cmdList = [];
  expect(cmds.series(cmdList, 100)).toEqual({
    type: "series",
    cmdList,
    delay: 100
  });
});

test("parallel()", () => {
  const cmdList = [];
  expect(cmds.parallel(cmdList)).toEqual({ type: "parallel", cmdList });
});

test("envelope()", () => {
  const cmd = cmds.now();
  expect(cmds.envelope(cmd)).toEqual({ type: "envelope", cmd });
});

test("either()", () => {
  const cmd = cmds.now();
  const defaultValue = 0;
  expect(cmds.either(cmd, defaultValue)).toEqual({
    type: "either",
    cmd,
    defaultValue
  });
});
