const { toArray, toPromise, delay } = require("./util");

function call(context, interpreters, fn, ...args) {
  if (!context) return Promise.reject(new Error("context required"));
  if (!fn) return Promise.reject(new Error("function required"));
  const gen = fn.apply(null, args);
  const el = newExecutionLog();
  const childContext = Object.assign({}, context);
  childContext.stack = (childContext.stack || []).concat({
    context: childContext,
    interpreters,
    fn,
    args
  });

  // clean up circular references to allow for serialization
  childContext.stack = childContext.stack.map(s => {
    s.context = Object.assign({}, s.context, { stack: undefined });
    return s;
  });
  const start = Date.now();
  onCall({ args, fn, context: childContext });
  return run(childContext, interpreters, fn, gen, null, el)
    .then(result => {
      if (!childContext.onCallComplete) return result;
      const end = Date.now();
      onCallComplete({
        success: true,
        fn,
        result,
        context: childContext,
        start,
        end,
        latency: end - start
      });
      return result;
    })
    .catch(e => {
      onError(e, childContext);
      if (!childContext.onCallComplete) return Promise.reject(e);
      const end = Date.now();
      onCallComplete({
        success: false,
        fn,
        result: e,
        context: childContext,
        start,
        end,
        latency: end - start
      });
      return Promise.reject(e);
    });
}

function run(context, interpreters, fn, gen, input, el, genOperation = "next") {
  try {
    const { output, done } = getNextOutput(gen, input, genOperation);
    if (done) return toPromise(output);
    const isList = Array.isArray(output);
    const commandsList = toArray(output);
    if (context.executionContext && context.executionContext.cancelled) {
      return Promise.reject(
        contextCancelError(context.executionContext.message)
      );
    }
    return processCommands(context, interpreters, fn, commandsList, el)
      .then(results => {
        if (context.executionContext && context.executionContext.cancelled) {
          return Promise.reject(
            contextCancelError(context.executionContext.message)
          );
        }
        const unwrappedResults = unwrapResults(isList, results);
        el.step++;
        return run(
          context,
          interpreters,
          fn,
          gen,
          unwrappedResults,
          el,
          "next"
        );
      })
      .catch(e => {
        el.step++;
        return run(context, interpreters, fn, gen, e, el, "throw");
      });
  } catch (e) {
    return Promise.reject(e);
  }
}

function contextCancelError(message) {
  const error = new Error(message || "Execution context cancelled");
  error.code = "CONTEXT_CANCELLED";
  return error;
}

function newExecutionLog() {
  return {
    step: 0
  };
}

function unwrapResults(isList, results) {
  return isList ? results : results[0];
}

function getNextOutput(fn, input, op) {
  const { value: output, done } = fn[op](input);
  return { output, done };
}

function processCommands(context, interpreters, fn, commands, el) {
  try {
    const pc = (c, index) =>
      processCommand(context, interpreters, fn, c, el, index);
    const promises = commands.map(pc);
    return Promise.all(promises);
  } catch (e) {
    // istanbul ignore next
    return Promise.reject(e);
  }
}

function processCommand(context, interpreters, fn, command, el, index) {
  const start = Date.now();
  onCommand({
    command,
    fn,
    start,
    index,
    step: el.step,
    context
  });
  let result;
  try {
    const interpreter = interpreters[command.type];
    if (!interpreter)
      return Promise.reject(
        new Error(`Interpreter of type "${command.type}" is not registered.`)
      );
    result = interpreter(command, { call, context, interpreters });
  } catch (e) {
    result = Promise.reject(e);
  }
  return toPromise(result)
    .then(r => {
      if (!context.onCommandComplete) return r;
      const end = Date.now();
      onCommandComplete({
        success: true,
        context,
        command,
        fn,
        step: el.step,
        index,
        result: r,
        start,
        end
      });
      return r;
    })
    .catch(e => {
      onError(e, context);
      if (!context.onCommandComplete) return Promise.reject(e);
      const end = Date.now();
      onCommandComplete({
        success: false,
        context,
        command,
        fn,
        step: el.step,
        index,
        result: e,
        start,
        end
      });
      return Promise.reject(e);
    });
}

function onCommand({ command, index, step, context, start, fn }) {
  if (!context.onCommand || typeof context.onCommand !== "function") return;
  const r = {
    command,
    start,
    index,
    step,
    context,
    fn
  };
  delay(() => context.onCommand(r));
}

function onError(error, context) {
  if (!context.onError) return;
  if (error.eadReported) return;
  // tag error to prevent multiple reports as the error bubbles up
  error.eadReported = true;
  delay(() => context.onError(error, context));
}

function onCommandComplete({
  success,
  command,
  index,
  step,
  result,
  context,
  start,
  end,
  fn
}) {
  const r = {
    success,
    command,
    latency: end - start,
    start,
    end,
    index,
    step,
    result,
    context,
    fn
  };
  delay(() => context.onCommandComplete(r));
}

function onCall({ args, fn, context }) {
  if (!context.onCall || typeof context.onCall !== "function") return;
  const r = {
    args,
    fn,
    context
  };
  delay(() => context.onCall(r));
}

function onCallComplete({ success, result, fn, context, start, end, latency }) {
  const r = {
    success,
    fn,
    context,
    end,
    latency,
    result,
    start
  };
  delay(() => context.onCallComplete(r));
}

function buildFunctions(context, interpreters, functions) {
  let promiseFunctions = {};
  for (let i in functions) {
    promiseFunctions[i] = function(...args) {
      const localContext = Object.assign({ name: i }, context);
      return call(localContext, interpreters, functions[i], ...args);
    };
  }
  return promiseFunctions;
}

module.exports = {
  call,
  buildFunctions
};
