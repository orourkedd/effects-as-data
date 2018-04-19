const { call } = require("../core");
const { interpreters, cmds } = require("./common");

function* basic(message) {
  return yield cmds.echo(message);
}

test("basic", async () => {
  const expected = "foo";
  const actual = await call({}, interpreters, basic, expected);
  expect(actual).toEqual(expected);
});

test("basic should be able to accept array arguments", async () => {
  const expected = ["foo", "bar"];
  const actual = await call({}, interpreters, basic, expected);
  expect(actual).toEqual(expected);
});

function* basicMultiArg(a, b) {
  return yield cmds.echo(a + b);
}

test("basicMultiArg", async () => {
  const actual = await call({}, interpreters, basicMultiArg, "foo", "bar");
  expect(actual).toEqual("foobar");
});

function* basicMultistep(message) {
  const s1 = yield cmds.echo(message + "1");
  const s2 = yield cmds.echo(message + "2");
  return { s1, s2 };
}

test("basicMultistep", async () => {
  const actual = await call({}, interpreters, basicMultistep, "foo");
  const expected = { s1: "foo1", s2: "foo2" };
  expect(actual).toEqual(expected);
});

function* basicParallel(message) {
  const [s1, s2] = yield [cmds.echo(message), cmds.echo(message)];
  return {
    s1: s1 + "1",
    s2: s2 + "2"
  };
}

test("basicParallel", async () => {
  const actual = await call({}, interpreters, basicParallel, "foo");
  const expected = { s1: "foo1", s2: "foo2" };
  expect(actual).toEqual(expected);
});

function* basicMultistepParallel(message) {
  const [s1, s2] = yield [cmds.echo(message), cmds.echo(message)];
  const [s3, s4] = yield [cmds.echo(message), cmds.echo(message)];
  return {
    s1: s1 + "1",
    s2: s2 + "2",
    s3: s3 + "3",
    s4: s4 + "4"
  };
}

test("basicMultistepParallel", async () => {
  const actual = await call({}, interpreters, basicMultistepParallel, "foo");
  const expected = { s1: "foo1", s2: "foo2", s3: "foo3", s4: "foo4" };
  expect(actual).toEqual(expected);
});

function* basicEmpty() {
  return yield [];
}

test("basicEmpty", async () => {
  const expected = [];
  const actual = await call({}, interpreters, basicEmpty);
  expect(actual).toEqual(expected);
});
