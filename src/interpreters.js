const { delay } = require("./util");

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

function noop() {}

function globalVariable({ name }) {
  // istanbul ignore next
  const g = typeof window === undefined ? global : window;
  return g[name];
}

function log({ args }) {
  console.log(...args);
}

function logError({ args }) {
  console.error(...args);
}

function getSubStack(context, resetStack) {
  return resetStack ? Object.assign({}, context, { stack: [] }) : context;
}

function setImmediateInterpreter(
  { cmd, resetStack },
  { call, context, interpreters }
) {
  delay(() => {
    const subcontext = getSubStack(context, resetStack);
    call(subcontext, interpreters, function*() {
      yield cmd;
    }).catch(e => e);
  });
}

function setTimeoutInterpreter(
  { cmd, time, resetStack },
  { call, context, interpreters }
) {
  return setTimeout(() => {
    const subcontext = getSubStack(context, resetStack);
    call(subcontext, interpreters, function*() {
      yield cmd;
    }).catch(e => e);
  }, time);
}

function clearTimeoutInterpreter({ id }) {
  return clearTimeout(id);
}

function setIntervalInterpreter(
  { cmd, time, resetStack },
  { call, context, interpreters }
) {
  return setInterval(() => {
    const subcontext = getSubStack(context, resetStack);
    call(subcontext, interpreters, function*() {
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

function series({ cmdList }, { call, context, interpreters }) {
  if (cmdList.length === 0) return [];
  return call(context, interpreters, function*() {
    const results = [];
    for (let i = 0; i < cmdList.length; i++) {
      const result = yield cmdList[i];
      results.push(result);
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

let state = {};

function getState({ path, defaultValue }) {
  if (!path) return state;
  const value = state[path];
  if (value === undefined) return defaultValue;
  return value;
}

function setState({ path, value }) {
  state[path] = value;
}

function clearState() {
  state = {};
}

module.exports = {
  call,
  callFn,
  callCallback,
  echo,
  noop,
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
  now,
  getState,
  setState,
  clearState
};
