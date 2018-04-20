const assert = require("assert");

function errorToJson(e) {
  const props = Object.getOwnPropertyNames(e).concat("name");
  return props.reduce((p, c) => {
    p[c] = e[c];
    return p;
  }, {});
}

function expectErrorEquality(e1, e2) {
  const ne1 = normalizeErrorForEquality(e1);
  const ne2 = normalizeErrorForEquality(e2);
  expect(ne1).toEqual(ne2);
}

function normalizeErrorForEquality(e) {
  if (!e) return e;
  if (typeof e === "string") return omitStack(errorToJson(new Error(e)));
  return omitStack(errorToJson(e));
}

function omitStack(s) {
  delete s.stack;
  return s;
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function deepEqual(actual, expected) {
  const a = normalizeError(actual);
  const e = normalizeError(expected);
  // istanbul ignore next
  if (usingJest()) expect(a).toEqual(e);
  else assert.deepEqual(a, e);
}

function normalizeError(v) {
  if (!isError(v)) return v;
  const props = Object.getOwnPropertyNames(v).concat("name");
  return props.reduce((p, c) => {
    if (c === "stack") return p;
    p[c] = v[c];
    return p;
  }, {});
}

function isError(e) {
  if (!e) return false;
  return e instanceof Error || e.code === "ERR_ASSERTION";
}

function usingJest() {
  return (
    typeof expect !== "undefined" &&
    Boolean(expect.extend) &&
    Boolean(expect.anything)
  );
}

module.exports = {
  errorToJson,
  expectErrorEquality,
  sleep,
  deepEqual,
  isError
};
