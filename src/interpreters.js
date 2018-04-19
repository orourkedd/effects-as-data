function call({ fn, args }, c) {
  return c.call(c.context, c.interpreters, fn.eadFn || fn, ...args);
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

function setImmediateInterpreter({ cmd }, { call, context, interpreters }) {
  delay(() => {
    call(context, interpreters, function*() {
      yield cmd;
    }).catch(e => e);
  });
}

function setTimeoutInterpreter({ cmd, time }, { call, context, interpreters }) {
  return setTimeout(() => {
    call(context, interpreters, function*() {
      yield cmd;
    }).catch(e => e);
  }, time);
}

function clearTimeoutInterpreter({ id }) {
  return clearTimeout(id);
}

function setIntervalInterpreter(
  { cmd, time },
  { call, context, interpreters }
) {
  return setInterval(() => {
    call(context, interpreters, function*() {
      yield cmd;
    }).catch(e => e);
  }, time);
}

function clearIntervalInterpreter({ id }) {
  return clearInterval(id);
}

function sleep({ time }) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function series({ cmdList, delay }, { call, context, interpreters }) {
  if (cmdList.length === 0) return [];
  return call(context, interpreters, function*() {
    const results = [];
    for (let i = 0; i < cmdList.length; i++) {
      const result = yield cmdList[i];
      results.push(result);
      if (delay && i < cmdList.length - 1) yield sleep(delay);
    }
    return results;
  });
}

function parallel({ cmdList }, { call, context, interpreters }) {
  return call(context, interpreters, function*() {
    return yield cmdList;
  });
}

function envelope({ cmd }, { call, context, interpreters }) {
  return call(context, interpreters, function*() {
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

function either({ cmd, defaultValue }, { call, context, interpreters }) {
  return call(context, interpreters, function*() {
    try {
      return yield cmd;
    } catch (e) {
      return defaultValue;
    }
  });
}

function now() {
  return Date.now();
}

module.exports = {
  call,
  callFn,
  callCallback,
  echo,
  globalVariable,
  log,
  logError,
  setImmediate: setImmediateInterpreter,
  setTimeout: setTimeoutInterpreter,
  clearTimeout: clearTimeoutInterpreter,
  setInterval: setIntervalInterpreter,
  clearInterval: clearIntervalInterpreter,
  sleep,
  series,
  parallel,
  envelope,
  either,
  now
};
