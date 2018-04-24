const assert = require("assert");
const {
  setImmediate,
  setTimeout,
  setInterval,
  globalVariable
} = require("../interpreters");
const { call } = require("../core");
const { interpreters, functions, cmds } = require("./common");
const { sleep } = require("./test-util");
const coreInterpreters = require("../interpreters");
const coreCmds = require("../cmds");

test("setImmediate() should swallow errors to prevent node uncaught rejection errors", async () => {
  const context = {};
  // Should not cause a node unhandled rejection error
  await setImmediate({ cmd: cmds.die() }, { call, context, interpreters });
  // wait for setImmediate to finish to get code coverage
  await sleep(10);
});

test("setImmediate() should reset stack, if resetStack is truthy", async () => {
  let count = 0;
  let stack;
  const onCommand = t => {
    if (t.command.type !== "call") return;
    count++;
    if (count >= 10) {
      stack = t.context.stack;
    }
  };
  function* nestedCall() {
    if (count >= 10) return;
    yield coreCmds.setImmediate(coreCmds.call(nestedCall), true);
  }
  const context = { onCommand, name: "telemetry" };
  const now = Date.now();
  await call(context, coreInterpreters, nestedCall, "foo");
  await sleep(50);
  expect(stack).toBeTruthy();
  expect(stack.length).toEqual(1);
});

test("setTimeout() should swallow errors to prevent node uncaught rejection errors", async () => {
  const context = {};
  // Should not cause a node unhandled rejection error
  await setTimeout(
    { cmd: cmds.die(), time: 0 },
    { call, context, interpreters }
  );
  // wait for setTimeout to finish to get code coverage
  await sleep(10);
});

test("setTimeout() should reset stack, if resetStack is truthy", async () => {
  let count = 0;
  let stack;
  const onCommand = t => {
    if (t.command.type !== "call") return;
    count++;
    if (count >= 10) {
      stack = t.context.stack;
    }
  };
  function* nestedCall() {
    if (count >= 10) return;
    yield coreCmds.setTimeout(coreCmds.call(nestedCall), 0, true);
  }
  const context = { onCommand, name: "telemetry" };
  const now = Date.now();
  await call(context, coreInterpreters, nestedCall, "foo");
  await sleep(50);
  expect(stack).toBeTruthy();
  expect(stack.length).toEqual(1);
});

test("setInterval() should swallow errors to prevent node uncaught rejection errors", async () => {
  const context = {};
  // Should not cause a node unhandled rejection error
  const id = await setInterval(
    { cmd: cmds.die(), time: 0 },
    { call, context, interpreters }
  );
  // wait for setInterval to finish to get code coverage
  await sleep(10);
  clearInterval(id);
});

test("setInterval() should reset stack, if resetStack is truthy", async () => {
  let count = 0;
  let stack;
  const onCommand = t => {
    if (t.command.type !== "now") return;
    count++;
    if (count >= 10) {
      stack = t.context.stack;
    }
  };
  function* nestedCall() {
    if (count >= 10) return;
    yield coreCmds.setInterval(coreCmds.now(), 0, true);
  }
  const context = { onCommand, name: "telemetry" };
  const now = Date.now();
  await call(context, coreInterpreters, nestedCall, "foo");
  await sleep(50);
  expect(stack).toBeTruthy();
  expect(stack.length).toEqual(1);
});

test("globalVariable() should use window if available", () => {
  window.foo = "bar";
  const value = globalVariable({ name: "foo" });
  assert.equal(value, "bar");
});
