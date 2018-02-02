const delay =
  typeof setImmediate === undefined ? fn => setTimeout(fn, 0) : setImmediate;

function async({ cmd }, { context, handlers, call }) {
  delay(() => {
    call(context, handlers, function*() {
      yield cmd;
    });
  });
}

module.exports = {
  async
};
