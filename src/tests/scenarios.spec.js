const { call } = require("../core");
const { interpreters, cmds, functions } = require("./common");

const {
  basic,
  basicMultistep,
  basicParallel,
  basicMultistepParallel,
  basicEmpty,
  basicMultiArg
} = functions;

test("should be able to process a command", async () => {
  const expected = "foo";
  const actual = await call({}, interpreters, basic, expected);
  expect(actual).toEqual(expected);
});

test("should be able to accept array arguments", async () => {
  const expected = ["foo", "bar"];
  const actual = await call({}, interpreters, basic, expected);
  expect(actual).toEqual(expected);
});

test("should be able to handle multiple arguments", async () => {
  const actual = await call({}, interpreters, basicMultiArg, "foo", "bar");
  expect(actual).toEqual("foobar");
});

test("should be able to process commands in multiple steps", async () => {
  const actual = await call({}, interpreters, basicMultistep, "foo");
  const expected = { s1: "foo1", s2: "foo2" };
  expect(actual).toEqual(expected);
});

test("should be able to process commands in parallel", async () => {
  const actual = await call({}, interpreters, basicParallel, "foo");
  const expected = { s1: "foo1", s2: "foo2" };
  expect(actual).toEqual(expected);
});

test("should be able to process commands in parallel, in multiple steps", async () => {
  const actual = await call({}, interpreters, basicMultistepParallel, "foo");
  const expected = { s1: "foo1", s2: "foo2", s3: "foo3", s4: "foo4" };
  expect(actual).toEqual(expected);
});

test("should be able to process an empty list of commands", async () => {
  const expected = [];
  const actual = await call({}, interpreters, basicEmpty);
  expect(actual).toEqual(expected);
});

test("interpreters should be able to return non-promise values", async () => {
  function* valueReturningInterpreter(value) {
    return yield cmds.echo(value);
  }

  const actual = await call({}, interpreters, valueReturningInterpreter, "bar");
  const expected = "bar";
  expect(actual).toEqual(expected);
});

test("interpreters should be able to return promises", async () => {
  function* promiseReturningInterpreter(value) {
    return yield cmds.echoPromise(value);
  }

  const actual = await call(
    {},
    interpreters,
    promiseReturningInterpreter,
    "bar"
  );
  const expected = "bar";
  expect(actual).toEqual(expected);
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
