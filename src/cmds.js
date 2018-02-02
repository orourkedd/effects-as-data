function call(fn, ...args) {
  const validator = (fn.fn || fn).validator;
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

// Call Shortcuts
call.fn = callFn;
call.fnBound = callFnBound;
call.callback = callCallback;
call.callbackBound = callCallbackBound;

module.exports = {
  call,
  callFn,
  callFnBound,
  callCallback,
  callCallbackBound,
  echo
};
