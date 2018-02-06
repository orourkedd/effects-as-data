const { promisify } = require("../index");
const { globalVariable } = require("../cmds");

test("globalVariable should return a global variable", async () => {
  const testValue = Math.random();
  process.env.testValue = testValue;
  function* testGlobalVariable() {
    const { env } = yield globalVariable("process");
    return env.testValue;
  }
  const actual = await promisify(testGlobalVariable)();
  expect(actual).toEqual(testValue);
});
