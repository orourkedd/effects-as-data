const { call } = require("../core");
const { handlers, cmds } = require("./common");

function* basic(message) {
  return yield cmds.echo(message);
}

function* basicMultiArg(a, b) {
  return yield cmds.echo(a + b);
}

function* basicMultistep(message) {
  const s1 = yield cmds.echo(message + "1");
  const s2 = yield cmds.echo(message + "2");
  return { s1, s2 };
}

function* basicParallel(message) {
  const [s1, s2] = yield [cmds.echo(message), cmds.echo(message)];
  return {
    s1: s1 + "1",
    s2: s2 + "2"
  };
}

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

function* basicEmpty() {
  return yield [];
}

test("basic", async () => {
  const expected = "foo";
  const actual = await call({}, handlers, basic, expected);
  expect(actual).toEqual(expected);
});

test("basic should be able to accept array arguments", async () => {
  const expected = ["foo", "bar"];
  const actual = await call({}, handlers, basic, expected);
  expect(actual).toEqual(expected);
});

test("basicMultiArg", async () => {
  const actual = await call({}, handlers, basicMultiArg, "foo", "bar");
  expect(actual).toEqual("foobar");
});

test("basicMultistep", async () => {
  const actual = await call({}, handlers, basicMultistep, "foo");
  const expected = { s1: "foo1", s2: "foo2" };
  expect(actual).toEqual(expected);
});

test("basicParallel", async () => {
  const actual = await call({}, handlers, basicParallel, "foo");
  const expected = { s1: "foo1", s2: "foo2" };
  expect(actual).toEqual(expected);
});

test("basicMultistepParallel", async () => {
  const actual = await call({}, handlers, basicMultistepParallel, "foo");
  const expected = { s1: "foo1", s2: "foo2", s3: "foo3", s4: "foo4" };
  expect(actual).toEqual(expected);
});

test("basicEmpty", async () => {
  const expected = [];
  const actual = await call({}, handlers, basicEmpty);
  expect(actual).toEqual(expected);
});
