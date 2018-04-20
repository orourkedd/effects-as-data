const assert = require("assert");
const {
  setImmediate,
  setTimeout,
  setInterval,
  globalVariable
} = require("../interpreters");
const { call } = require("../core");
const { interpreters, functions, cmds } = require("./common");
const { sleep } = require("./util");

test("setImmediate() should swallow errors to prevent node uncaught rejection errors", async () => {
  const context = {};
  // Should not cause a node unhandled rejection error
  await setImmediate({ cmd: cmds.die() }, { call, context, interpreters });
  // wait for setImmediate to finish to get code coverage
  await sleep(10);
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

test("globalVariable() should use window if available", () => {
  window.foo = "bar";
  const value = globalVariable({ name: "foo" });
  assert.equal(value, "bar");
});
