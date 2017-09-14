const { call } = require("../index");
const { functions, handlers } = require("./effects");
const { async } = handlers;
const { asyncTest } = functions;
const { sleep } = require("./test-util");

test("async", async () => {
  let called = false;
  const testHandler = () => {
    called = true;
  };
  await call({}, { async, test: testHandler }, asyncTest);
  expect(called).toEqual(false);
  await sleep(50);
  expect(called).toEqual(true);
});
