function either({ cmd, defaultValue }, { context, handlers, call }) {
  return call(context, handlers, function*() {
    try {
      const result = yield cmd;
      return result || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });
}

module.exports = {
  either
};
