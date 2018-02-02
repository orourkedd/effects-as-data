function call({ fn, args }, c) {
  return c.call(c.context, c.handlers, fn.fn || fn, ...args);
}

function callFn({ fn, bindThis, args }, c) {
  if (fn.fn) {
    return call({ fn, args }, c);
  } else {
    return fn.call(bindThis, ...args);
  }
}

function callCallback({ fn, bindThis, args }, c) {
  return new Promise((resolve, reject) => {
    try {
      fn.apply(
        bindThis,
        args.concat((err, ...results) => {
          if (err) return reject(err);
          else resolve(...results);
        })
      );
    } catch (e) {
      reject(e);
    }
  });
}

function echo({ message }) {
  return message;
}

module.exports = {
  call,
  callFn,
  callCallback,
  echo
};
