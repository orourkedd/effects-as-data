function call({ fn, args }, c) {
  return c.call(c.context, c.handlers, fn.eadFn || fn, ...args);
}

function callFn({ fn, bindThis, args }, c) {
  if (fn.eadFn) {
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

function globalVariable({ name }) {
  const g = typeof window === undefined ? global : window;
  return g[name];
}

function log({ args }) {
  console.log(...args);
}

function logError({ args }) {
  console.error(...args);
}

const delay =
  typeof setImmediate === undefined ? fn => setTimeout(fn, 0) : setImmediate;

function setImmediateHandler({ cmd }, { call, context, handlers }) {
  delay(() => {
    call(context, handlers, function*() {
      yield cmd;
    }).catch(e => e);
  });
}

function setTimeoutHandler({ cmd, time }, { call, context, handlers }) {
  return setTimeout(() => {
    call(context, handlers, function*() {
      yield cmd;
    }).catch(e => e);
  }, time);
}

function clearTimeoutHandler({ id }) {
  return clearTimeout(id);
}

function setIntervalHandler({ cmd, time }, { call, context, handlers }) {
  return setInterval(() => {
    call(context, handlers, function*() {
      yield cmd;
    }).catch(e => e);
  }, time);
}
function clearIntervalHandler({ id }) {
  return clearInterval(id);
}

function sleep({ time }) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function series({ cmdList, delay }, { call, context, handlers }) {
  if (cmdList.length === 0) return [];
  return call(context, handlers, function*() {
    const results = [];
    for (let i = 0; i < cmdList.length; i++) {
      const result = yield cmdList[i];
      results.push(result);
      if (delay && i < cmdList.length - 1) yield sleep(delay);
    }
    return results;
  });
}

function parallel({ cmdList }, { call, context, handlers }) {
  return call(context, handlers, function*() {
    return yield cmdList;
  });
}

function envelope({ cmd }, { call, context, handlers }) {
  return call(context, handlers, function*() {
    return yield cmd;
  })
    .then(result => {
      return {
        success: true,
        result
      };
    })
    .catch(e => {
      return {
        success: false,
        result: e
      };
    });
}

function either({ cmd, defaultValue }, { call, context, handlers }) {
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
  call,
  callFn,
  callCallback,
  echo,
  globalVariable,
  log,
  logError,
  setImmediate: setImmediateHandler,
  setTimeout: setTimeoutHandler,
  clearTimeout: clearTimeoutHandler,
  setInterval: setIntervalHandler,
  clearInterval: clearIntervalHandler,
  sleep,
  series,
  parallel,
  envelope,
  either
};
