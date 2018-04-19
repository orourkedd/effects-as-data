const { call } = require("../core");
const { interpreters, functions, cmds } = require("./common");
const { badInterpreter, badInterpreterRejection } = functions;
const { expectError } = require("./util");

function* valueReturningInterpreter(value) {
  return yield cmds.echo(value);
}

function* promiseReturningInterpreter(value) {
  return yield cmds.echoPromise(value);
}

test("interpreters should be able to return non-promise values", async () => {
  const actual = await call({}, interpreters, valueReturningInterpreter, "bar");
  const expected = "bar";
  expect(actual).toEqual(expected);
});

test("interpreters should be able to return promises", async () => {
  const actual = await call(
    {},
    interpreters,
    promiseReturningInterpreter,
    "bar"
  );
  const expected = "bar";
  expect(actual).toEqual(expected);
});

test("call should reject when a interpreter throws and is not caught", async () => {
  try {
    await call({}, interpreters, badInterpreter);
  } catch (actual) {
    const message = "oops";
    return expectError(actual, message);
  }
  fail("Function did not reject.");
});

test("call should reject when a interpreter rejects and is not caught", async () => {
  try {
    await call({}, interpreters, badInterpreterRejection);
  } catch (actual) {
    const message = "oops";
    return expectError(actual, message);
  }
  fail("Function did not reject.");
});

test("interpreters should be able to return an array of results", async () => {
  const fn = function*(a, b) {
    const result = yield [cmds.echo(a), cmds.echo(b)];
    return result;
  };
  const actual = await call(
    {},
    interpreters,
    fn,
    ["foo", "bar"],
    ["foo", "baz"]
  );
  const expected = [["foo", "bar"], ["foo", "baz"]];
  expect(actual).toEqual(expected);
});
