const { call, buildFunctions } = require("../core");
const { handlers, functions, cmds } = require("./effects");
const { basicMultistep, badHandler, basic } = functions;
const { sleep } = require("./test-util");

test("telemetry - should add a correlation id to the context", async () => {
  let telemetry;
  const onCommand = t => {
    telemetry = t;
  };
  const context = { onCommand, name: "telemetry" };
  const now = Date.now();
  await call(context, handlers, basic, "foo");
  await sleep(10);
  expect(telemetry.context.cid.length).toEqual(36);

  // Should be serializable
  JSON.stringify(telemetry);
});

test("telemetry - should use an existing correlation id if on the context", async () => {
  let telemetry;
  const onCommand = t => {
    telemetry = t;
  };
  const context = { onCommand, name: "telemetry", cid: "foo" };
  const now = Date.now();
  await call(context, handlers, basic, "bar");
  await sleep(10);
  expect(telemetry.context.cid).toEqual("foo");

  // Should be serializable
  JSON.stringify(telemetry);
});

test("telemetry - should add a stack to the context and push the current frame", async () => {
  let telemetry;
  const onCommand = t => {
    telemetry = t;
  };
  const context = { onCommand, name: "telemetry" };
  const now = Date.now();
  await call(context, handlers, basic, "foo");
  await sleep(10);
  expect(telemetry.context.stack[0].fn).toEqual(basic);
  expect(telemetry.context.stack[0].handlers).toEqual(handlers);
  expect(telemetry.context.stack[0].args).toEqual(["foo"]);
  expect(telemetry.context.stack[0].context.onCommand).toEqual(onCommand);
  expect(telemetry.context.stack[0].context.name).toEqual("telemetry");
  expect(telemetry.context.stack[0].context.stack).toEqual(undefined);

  // Should be serializable
  JSON.stringify(telemetry);
});

test("telemetry - should add a stack to the context for child calls", async () => {
  let telemetry;
  const onCommand = t => {
    telemetry = t;
  };
  const context = { onCommand, name: "telemetry" };
  const now = Date.now();
  await call(context, handlers, basic, "foo");
  await sleep(10);
  expect(telemetry.context.stack[0].fn).toEqual(basic);
  expect(telemetry.context.stack[0].handlers).toEqual(handlers);
  expect(telemetry.context.stack[0].args).toEqual(["foo"]);
  expect(telemetry.context.stack[0].context.onCommand).toEqual(onCommand);
  expect(telemetry.context.stack[0].context.name).toEqual("telemetry");
  expect(telemetry.context.stack[0].context.cid.length).toEqual(36);
  expect(telemetry.context.stack[0].context.stack).toEqual(undefined);

  // Should be serializable
  JSON.stringify(telemetry);
});

test("telemetry - onCommand", async () => {
  let telemetry = [];
  const onCommand = t => {
    telemetry.push(t);
  };
  const context = { onCommand, name: "telemetry" };
  const now = Date.now();
  await call(context, handlers, basicMultistep, "foo");
  await sleep(10);
  expect(telemetry.length).toEqual(2);
  telemetry.forEach((t, i) => {
    const message = "foo" + (i + 1);
    expect(t.command).toEqual(cmds.echo(message));
    expect(t.fn).toEqual(basicMultistep);
    expect(t.start).toBeGreaterThanOrEqual(now);
    expect(t.index).toEqual(0);
    expect(t.step).toEqual(i);
    expect(t.context.name).toEqual("telemetry");
    expect(t.context.stack[0].fn).toEqual(basicMultistep);
  });

  // Should be serializable
  JSON.stringify(telemetry);
});

test("telemetry - onCommandComplete", async () => {
  let telemetry = [];
  const onCommandComplete = t => {
    telemetry.push(t);
  };
  const context = { onCommandComplete, name: "telemetry" };
  const now = Date.now();
  await call(context, handlers, basicMultistep, "foo");
  await sleep(10);
  expect(telemetry.length).toEqual(2);
  telemetry.forEach((t, i) => {
    const message = "foo" + (i + 1);
    expect(t.success).toEqual(true);
    expect(t.command).toEqual(cmds.echo(message));
    expect(t.latency).toBeLessThan(5);
    expect(t.start).toBeGreaterThanOrEqual(now);
    expect(t.end).toBeGreaterThanOrEqual(t.start);
    expect(t.index).toEqual(0);
    expect(t.step).toEqual(i);
    expect(t.result).toEqual(message);
    expect(t.context.name).toEqual("telemetry");
    expect(t.context.stack[0].fn).toEqual(basicMultistep);
    expect(t.fn).toEqual(basicMultistep);
  });

  // Should be serializable
  JSON.stringify(telemetry);
});

test("telemetry on error - onCommandComplete", async () => {
  let telemetry;
  const onCommandComplete = t => {
    telemetry = t;
  };
  const context = { onCommandComplete, name: "badHandler" };
  const now = Date.now();
  const message = "oops";
  try {
    await call(context, handlers, badHandler, message);
  } catch (e) {}
  await sleep(10);
  expect(telemetry.success).toEqual(false);
  expect(telemetry.command).toEqual(cmds.die(message));
  expect(telemetry.latency).toBeLessThan(5);
  expect(telemetry.start).toBeGreaterThanOrEqual(now);
  expect(telemetry.end).toBeGreaterThanOrEqual(telemetry.start);
  expect(telemetry.index).toEqual(0);
  expect(telemetry.step).toEqual(0);
  expect(telemetry.result.message).toEqual("oops");
  expect(telemetry.context.name).toEqual("badHandler");
  expect(telemetry.context.stack[0].fn).toEqual(badHandler);
  expect(telemetry.fn).toEqual(badHandler);

  // Should be serializable
  JSON.stringify(telemetry);
});

test("onCall", done => {
  const onCall = called => {
    expect(called.args).toEqual(["foo", "bar", "baz"]);
    done();
  };
  const context = { onCall };
  call(context, handlers, basicMultistep, "foo", "bar", "baz");
});

test("onCallComplete", done => {
  const now = Date.now();
  const onCallComplete = complete => {
    expect(complete.success).toEqual(true);
    expect(complete.fn).toEqual(basic);
    expect(complete.result).toEqual("foo");
    expect(typeof complete.latency).toEqual("number");
    expect(complete.start).toBeGreaterThanOrEqual(now);
    expect(complete.end).toBeGreaterThanOrEqual(complete.start);
    done();
  };
  const context = { onCallComplete, name: "telemetry" };
  call(context, handlers, basic, "foo");
});

test("onCallComplete for errors from handlers", done => {
  const now = Date.now();
  const onCallComplete = complete => {
    expect(complete.success).toEqual(false);
    expect(complete.fn).toEqual(badHandler);
    expect(complete.result.message).toEqual("oops");
    expect(typeof complete.latency).toEqual("number");
    expect(complete.start).toBeGreaterThanOrEqual(now);
    expect(complete.end).toBeGreaterThanOrEqual(complete.start);
    done();
  };
  const context = { onCallComplete, name: "telemetry" };
  call(context, handlers, badHandler, "foo").catch(e => e);
});

test("onCallComplete for errors from function body", done => {
  const now = Date.now();
  const onCallComplete = complete => {
    expect(complete.success).toEqual(false);
    expect(complete.fn).toEqual(throwFromBody);
    expect(complete.result.message).toEqual("oops");
    expect(typeof complete.latency).toEqual("number");
    expect(complete.start).toBeGreaterThanOrEqual(now);
    expect(complete.end).toBeGreaterThanOrEqual(complete.start);
    done();
  };
  function* throwFromBody() {
    throw new Error("oops");
  }
  const context = { onCallComplete, name: "telemetry" };
  call(context, handlers, throwFromBody).catch(e => e);
});

test("onCallComplete for errors from function body when using buildFunctions", done => {
  const now = Date.now();
  const onCallComplete = complete => {
    expect(complete.success).toEqual(false);
    expect(complete.fn).toEqual(throwFromBody);
    expect(complete.result.message).toEqual("oops");
    expect(typeof complete.latency).toEqual("number");
    expect(complete.start).toBeGreaterThanOrEqual(now);
    expect(complete.end).toBeGreaterThanOrEqual(complete.start);
    done();
  };
  function* throwFromBody() {
    yield cmds.echo("foo");
    throw new Error("oops");
  }
  const context = { onCallComplete, name: "telemetry" };
  const built = buildFunctions(context, handlers, { throwFromBody });
  built.throwFromBody().catch(e => e);
});

test("telemetry onError - handler", async () => {
  let error;
  let callCount = 0;
  const onError = e => {
    error = e;
    callCount++;
  };
  const context = { onError, name: "badHandler" };
  const now = Date.now();
  const message = "oops";
  try {
    await call(context, handlers, badHandler, message);
  } catch (e) {}
  await sleep(10);
  expect(error.message).toEqual("oops");
  expect(error.context.name).toEqual("badHandler");
  expect(error.context.stack[0].fn).toEqual(badHandler);
  expect(error.context.stack[0].args).toEqual([message]);
  expect(callCount).toEqual(1);

  // Should be serializable
  JSON.stringify(error);
});

test("telemetry onError - function body", async () => {
  let error;
  let callCount = 0;
  const onError = e => {
    error = e;
    callCount++;
  };
  const context = { onError, name: "throwFromBody" };
  const now = Date.now();
  function* throwFromBody() {
    yield cmds.echo("foo");
    throw new Error("oops");
  }
  try {
    await call(context, handlers, throwFromBody, "arg1", "arg2");
  } catch (e) {}
  await sleep(10);
  expect(error.message).toEqual("oops");
  expect(error.context.name).toEqual("throwFromBody");
  expect(error.context.stack[0].fn).toEqual(throwFromBody);
  expect(error.context.stack[0].args).toEqual(["arg1", "arg2"]);
  expect(callCount).toEqual(1);

  // Should be serializable
  JSON.stringify(error);
});
