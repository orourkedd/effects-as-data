const assert = require("assert");
const { call } = require("../core");
const { interpreters, cmds, functions } = require("./common");
const { expectErrorEquality } = require("./test-util");

const { basic, usesThrowingInterpreter, usesRejectingInterpreter } = functions;

test("call should reject when a interpreter throws and is not caught", async () => {
  try {
    await call({}, interpreters, usesThrowingInterpreter);
  } catch (actual) {
    const message = "oops";
    return expectErrorEquality(actual, message);
  }
  fail("Function did not reject.");
});

test("call should reject when a interpreter rejects and is not caught", async () => {
  try {
    await call({}, interpreters, usesRejectingInterpreter);
  } catch (actual) {
    const message = "oops";
    return expectErrorEquality(actual, message);
  }
  fail("Function did not reject.");
});

test("call should reject if no context passed in", async () => {
  try {
    await call(null, interpreters, basic);
  } catch (e) {
    assert.equal(e.message, "context required");
    return;
  }
  fail("did not throw");
});

test("call should reject if no function passed in", async () => {
  try {
    await call({}, interpreters);
  } catch (e) {
    assert.equal(e.message, "function required");
    return;
  }
  fail("did not throw");
});
