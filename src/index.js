const core = require("./core");
const coreCmds = require("./cmds");
const coreHandlers = require("./handlers");

let handlers = Object.assign({}, coreHandlers);
let context = {};

function promisify(fn) {
  if (fn.eadPromisified) return fn;
  const validator = fn.validator;
  const promised = function(...args) {
    if (validator) {
      try {
        validator(...args);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return core.call(context, handlers, fn, ...args);
  };
  // try/catch because this is nice, but not necessary
  // Note: there is a unit test to validate this behavior
  // so errors, although swallowed here, would be picked
  // up in the unit test.
  try {
    Object.defineProperty(promised, "name", {
      value: fn.name,
      writable: false
    });
  } catch (e) {}
  promised.eadFn = fn;

  promised.callWithContext = function(c, ...args) {
    if (validator) {
      try {
        validator(...args);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return core.call(Object.assign({}, context, c), handlers, fn, ...args);
  };

  promised.eadPromisified = true;

  return promised;
}

function setContext(c) {
  context = c;
}

function getContext() {
  return context;
}

function addToContext(c) {
  context = Object.assign({}, context, c);
}

function setHandlers(h) {
  handlers = h;
}

function getHandlers() {
  return handlers;
}

function addToHandlers(h) {
  handlers = Object.assign({}, handlers, h);
}

function reset() {
  handlers = {};
  context = {};
}

module.exports = {
  ...coreCmds,
  cmds: coreCmds,
  handlers: coreHandlers,
  promisify,
  setContext,
  getContext,
  addToContext,
  setHandlers,
  getHandlers,
  addToHandlers,
  reset
};
