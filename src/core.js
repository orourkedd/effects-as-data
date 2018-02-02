const { toArray, toPromise, delay, uuid } = require("./util");

function call(context, handlers, fn, ...args) {
  if (!context) throw new Error("context is required.");
  if (!fn) return Promise.reject(new Error("A function is required."));
  const gen = fn.apply(null, args);
  const el = newExecutionLog();
  const childContext = Object.assign({}, context);
  childContext.cid = childContext.cid || uuid();
  // clean up circular references
  const stack = (context.stack || []).map(s => {
    s.context.stack = undefined;
    return s;
  });
  childContext.stack = stack.concat({
    context: childContext,
    handlers,
    fn,
    args
  });
  const start = Date.now();
  onCall({ args, fn, context: childContext });
  return run(childContext, handlers, fn, gen, null, el)
    .then(result => {
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

function run(context, handlers, fn, gen, input, el, genOperation = "next") {
  try {
    const { output, done } = getNextOutput(gen, input, genOperation);
    if (done) return toPromise(output);
    const isList = Array.isArray(output);
    const commandsList = toArray(output);
    return processCommands(context, handlers, fn, commandsList, el)
      .then(results => {
        const unwrappedResults = unwrapResults(isList, results);
        el.step++;
        return run(context, handlers, fn, gen, unwrappedResults, el, "next");
      })
      .catch(e => {
        el.step++;
        return run(context, handlers, fn, gen, e, el, "throw");
      });
  } catch (e) {
    return Promise.reject(e);
  }
}

function newExecutionLog() {
  return {
    step: 0
  };
}

function unwrapResults(isList, results) {
  return isList ? results : results[0];
}

function getNextOutput(fn, input, op = "next") {
  const { value: output, done } = fn[op](input);
  return { output, done };
}

function processCommands(context, handlers, fn, commands, el) {
  try {
    const pc = (c, index) =>
      processCommand(context, handlers, fn, c, el, index);
    const promises = commands.map(pc);
    return Promise.all(promises);
  } catch (e) {
    return Promise.reject(e);
  }
}

function processCommand(context, handlers, fn, command, el, index) {
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
    const handler = handlers[command.type];
    if (!handler)
      return Promise.reject(
        new Error(`Handler of type "${command.type}" is not registered.`)
      );
    result = handler(command, { call, context, handlers });
  } catch (e) {
    result = Promise.reject(e);
  }
  return toPromise(result)
    .then(r => {
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
  if (
    !context.onCommandComplete ||
    typeof context.onCommandComplete !== "function"
  )
    return;
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
  if (!context.onCallComplete || typeof context.onCallComplete !== "function")
    return;
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

function buildFunctions(context, handlers, functions) {
  let promiseFunctions = {};
  for (let i in functions) {
    promiseFunctions[i] = function(...args) {
      const localContext = Object.assign({ name: i }, context);
      return call(localContext, handlers, functions[i], ...args);
    };
  }
  return promiseFunctions;
}

module.exports = {
  call,
  buildFunctions
};
