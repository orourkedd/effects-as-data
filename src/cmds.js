function call(fn, ...args) {
  const validator = (fn.fn || fn).validator;
  if (validator) validator(...args);
  return {
    type: "call",
    fn,
    args
  };
}

function callPromise(fn, ...args) {
  return {
    type: "callPromise",
    fn,
    args
  };
}

function callPromiseBound(bindThis, fn, ...args) {
  return {
    type: "callPromise",
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

// Call Shortcuts
call.promise = callPromise;
call.promiseBound = callPromiseBound;
call.callback = callCallback;
call.callbackBound = callCallbackBound;

module.exports = {
  call,
  callPromise,
  callPromiseBound,
  callCallback,
  callCallbackBound,
  echo
};
