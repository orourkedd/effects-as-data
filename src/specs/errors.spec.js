const { call } = require("../core");
const { handlers, functions, cmds } = require("./common");
const { badHandler, thrower } = functions;
const { expectError } = require("./test-util");

function* throwInFn() {
  throw new Error("oops!");
}

function* throwAtYield() {
  try {
    yield cmds.die();
  } catch (e) {
    return "caught!";
  }
  return "not caught";
}

function* throwAtYieldRecovery() {
  try {
    yield cmds.die();
  } catch (e) {}
  return yield cmds.echo("foo");
}

test("call should reject for an undefined function", async () => {
  try {
    await call({}, handlers, undefined);
  } catch (actual) {
    const message = "A function is required.";
    return expectError(actual, message);
  }
  fail("Function did not reject.");
});

test("call should catch function errors", async () => {
  try {
    await call({}, handlers, throwInFn);
  } catch (actual) {
    const message = "oops!";
    return expectError(actual, message);
  }
  fail("Function did not reject.");
});

test("call should throw error at the yield", async () => {
  const actual = await call({}, handlers, throwAtYield);
  const expected = "caught!";
  expect(actual).toEqual(expected);
});

test("call should throw error at the yield and recover", async () => {
  const actual = await call({}, handlers, throwAtYieldRecovery);
  const expected = "foo";
  expect(actual).toEqual(expected);
});

test("call should throw error for unregistered handler", async () => {
  const fn = function*() {
    yield { type: "dne" };
  };
  try {
    await call({}, handlers, fn);
  } catch (e) {
    expect(e.message).toEqual('Handler of type "dne" is not registered.');
    return;
  }
  fail("Did not throw.");
});
