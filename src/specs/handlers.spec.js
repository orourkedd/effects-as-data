const { call } = require("../index");
const { handlers, functions, cmds } = require("./effects");
const {
  badHandler,
  badHandlerRejection,
  valueReturningHandler,
  promiseReturningHandler
} = functions;
const { expectError } = require("./test-util");

test("handlers should be able to return non-promise values", async () => {
  const actual = await call({}, handlers, valueReturningHandler, "bar");
  const expected = "bar";
  expect(actual).toEqual(expected);
});

test("handlers should be able to return promises", async () => {
  const actual = await call({}, handlers, promiseReturningHandler, "bar");
  const expected = "bar";
  expect(actual).toEqual(expected);
});

test("call should reject when a handler throws and is not caught", async () => {
  try {
    await call({}, handlers, badHandler);
  } catch (actual) {
    const message = "oops";
    return expectError(actual, message);
  }
  fail("Function did not reject.");
});

test("call should reject when a handler rejects and is not caught", async () => {
  try {
    await call({}, handlers, badHandlerRejection);
  } catch (actual) {
    const message = "oops";
    return expectError(actual, message);
  }
  fail("Function did not reject.");
});

test("handlers should be able to return an array of results", async () => {
  const fn = function*(a, b) {
    const result = yield [cmds.echo(a), cmds.echo(b)];
    return result;
  };
  const actual = await call({}, handlers, fn, ["foo", "bar"], ["foo", "baz"]);
  const expected = [["foo", "bar"], ["foo", "baz"]];
  expect(actual).toEqual(expected);
});
