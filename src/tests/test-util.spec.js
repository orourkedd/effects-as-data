const { errorToJson, expectErrorEquality } = require("./test-util");

test("errorToJson()", () => {
  const error = new Error("oops");
  error.code = "OOPS";

  const jsonError = errorToJson(error);

  expect(jsonError).toEqual({
    name: "Error",
    message: "oops",
    code: "OOPS",
    stack: error.stack
  });
});

test("expectErrorEquality() should not throw if errors are equal", () => {
  const error1 = new Error("foo");
  expectErrorEquality(error1, error1);
});

test("expectErrorEquality() should throw if errors are different", () => {
  const error1 = new Error("foo");
  const error2 = new Error("bar");
  expect(() => expectErrorEquality(error1, error2)).toThrow();
});

test("expectErrorEquality() should convert string to errors (right)", () => {
  const error1 = new Error("foo");
  expectErrorEquality(error1, "foo");
});

test("expectErrorEquality() should convert string to errors (left)", () => {
  const error1 = new Error("foo");
  expectErrorEquality("foo", error1);
});

test("expectErrorEquality() should throw if errors are using strings", () => {
  const error1 = new Error("foo");
  expect(() => expectErrorEquality(error1, "bar")).toThrow();
});

test("expectErrorEquality() should not throw even if stack traces are different", () => {
  const error1 = new Error("foo");
  const error2 = new Error("foo");
  expectErrorEquality(error1, error2);
});

test("expectErrorEquality() should not throw if an error is compared to null (right)", () => {
  const error1 = new Error("foo");
  expect(() => expectErrorEquality(error1, null)).toThrow();
});

test("expectErrorEquality() should not throw if an error is compared to null (left)", () => {
  const error1 = new Error("foo");
  expect(() => expectErrorEquality(null, error1)).toThrow();
});
