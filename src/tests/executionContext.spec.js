const { call } = require("../core");
const { interpreters, cmds, functions } = require("./common");

test("executionContext.cancelled should stop execution before cmd processing", async () => {
  const executionContext = {};
  const context = { executionContext };

  let step = 0;
  function* ecTest() {
    executionContext.cancelled = true;
    executionContext.message = "timeout";
    yield cmds.echo("1");
    step++;
    yield cmds.echo("2");
    step++;
  }
  try {
    await call(context, interpreters, ecTest);
  } catch (e) {
    expect(step).toEqual(0);
    expect(e.message).toEqual("timeout");
    expect(e.code).toEqual("CONTEXT_CANCELLED");
    return;
  }
  fail("did not throw on cancellation");
});

test("executionContext.cancelled should stop execution after cmd processing", async () => {
  const executionContext = {};
  const context = { executionContext };

  let step = 0;
  function* ecTest() {
    yield cmds.echo("1");
    step++;
    executionContext.cancelled = true;
    executionContext.message = "timeout";
    yield cmds.echo("2");
    step++;
  }
  try {
    await call(context, interpreters, ecTest);
  } catch (e) {
    expect(step).toEqual(1);
    expect(e.message).toEqual("timeout");
    expect(e.code).toEqual("CONTEXT_CANCELLED");
    return;
  }
  fail("did not throw on cancellation");
});

test("executionContext.cancelled should stop execution and use default message", async () => {
  const executionContext = {};
  const context = { executionContext };

  let step = 0;
  function* ecTest() {
    executionContext.cancelled = true;
    yield cmds.echo("1");
    step++;
    yield cmds.echo("2");
    step++;
  }
  try {
    await call(context, interpreters, ecTest);
  } catch (e) {
    expect(step).toEqual(0);
    expect(e.message).toEqual("Execution context cancelled");
    expect(e.code).toEqual("CONTEXT_CANCELLED");
    return;
  }
  fail("did not throw on cancellation");
});

test("cancel should cancel using cancel function", async () => {
  const executionContext = {};
  const context = { executionContext };

  let step = 0;
  function* ecTest() {
    executionContext.cancelled = true;
    executionContext.message = "timeout";
    yield cmds.echo("1");
    step++;
    yield cmds.echo("2");
    step++;
  }
  try {
    const result = call(context, interpreters, ecTest);
    result.cancel();
    setTimeout(async () => {});
  } catch (e) {
    expect(step).toEqual(0);
    expect(e.message).toEqual("timeout");
    expect(e.code).toEqual("CONTEXT_CANCELLED");
    return;
  }
  fail("did not throw on cancellation");
});
