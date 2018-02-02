function either(cmd, defaultValue) {
  return {
    type: "either",
    cmd,
    defaultValue
  };
}

module.exports = {
  either
};
