function call(fn, ...args) {
  const validator = (fn.eadFn || fn).validator;
  if (validator) validator(...args);
  return {
    type: "call",
    fn,
    args
  };
}

function callFn(fn, ...args) {
  return {
    type: "callFn",
    fn,
    args
  };
}

function callFnBound(bindThis, fn, ...args) {
  return {
    type: "callFn",
    fn,
    bindThis,
    args
  };
}

function callCallback(fn, ...args) {
  return {
    type: "callCallback",
    fn,
    args
  };
}

function callCallbackBound(bindThis, fn, ...args) {
  return {
    type: "callCallback",
    fn,
    bindThis,
    args
  };
}

function echo(message) {
  return {
    type: "echo",
    message
  };
}

function globalVariable(name) {
  if (!name) throw new Error("name required.");
  return {
    type: "globalVariable",
    name
  };
}

function log(...args) {
  return {
    type: "log",
    level: "info",
    args
  };
}

function logError(...args) {
  return {
    type: "logError",
    args
  };
}

function setImmediateCmd(cmd) {
  return {
    type: "setImmediate",
    cmd
  };
}

function setTimeoutCmd(cmd, time) {
  return {
    type: "setTimeout",
    cmd,
    time
  };
}

function clearTimeoutCmd(id) {
  return {
    type: "clearTimeout",
    id
  };
}

function setIntervalCmd(cmd, time) {
  return {
    type: "setInterval",
    cmd,
    time
  };
}

function clearIntervalCmd(id) {
  return {
    type: "clearInterval",
    id
  };
}

function sleep(time) {
  return {
    type: "sleep",
    time
  };
}

function series(cmdList, delay) {
  return {
    type: "series",
    cmdList,
    delay
  };
}

function parallel(cmdList) {
  return {
    type: "parallel",
    cmdList
  };
}

function envelope(cmd) {
  return {
    type: "envelope",
    cmd
  };
}

function now() {
  return call.fn(Date.now);
}

function either(cmd, defaultValue) {
  return {
    type: "either",
    cmd,
    defaultValue
  };
}

// Call Shortcuts
call.fn = callFn;
call.fnBound = callFnBound;
call.callback = callCallback;
call.callbackBound = callCallbackBound;

module.exports = {
  call,
  callFn,
  fn: callFn,
  callFnBound,
  callCallback,
  callback: callCallback,
  callCallbackBound,
  echo,
  now,
  globalVariable,
  log,
  logError,
  setImmediate: setImmediateCmd,
  setTimeout: setTimeoutCmd,
  clearTimeout: clearTimeoutCmd,
  setInterval: setIntervalCmd,
  clearInterval: clearIntervalCmd,
  sleep,
  series,
  parallel,
  envelope,
  either
};
