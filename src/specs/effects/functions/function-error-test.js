function* functionErrorTest() {
  throw new Error("oops!");
}

module.exports = {
  functionErrorTest
};
