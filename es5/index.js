'use strict';

var _require = require('./util'),
    isGenerator = _require.isGenerator,
    toArray = _require.toArray,
    errorToJson = _require.errorToJson,
    toPromise = _require.toPromise;

function call(config, handlers, fn) {
  for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  return run(config, handlers, fn, args);
}

function run(config, handlers, fn, input, el) {
  var generatorOperation = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'next';

  try {
    var el1 = getExecutionLog(el);
    if (!fn) {
      var noFunctionMessage = 'A function is required. Perhaps your function is undefined?';
      throw new Error(noFunctionMessage);
    }

    var _getNextOutput = getNextOutput(fn, input, generatorOperation),
        output = _getNextOutput.output,
        isList = _getNextOutput.isList,
        done = _getNextOutput.done,
        fn2 = _getNextOutput.fn2;

    if (done) return toPromise(output);
    var commandsList = toArray(output);
    return processCommands(config, handlers, commandsList, el1).then(function (results) {
      var unwrappedResults = unwrapResults(isList, results);
      el1.step = el1.step + 1; // mutate in place
      return run(config, handlers, fn2, unwrappedResults, el1);
    }).catch(function (e) {
      //  ok to mutate?
      el1.step = el1.step + 1; // mutate in place
      return run(config, handlers, fn2, e, el1, 'throw');
    });
  } catch (e) {
    return Promise.reject(errorToJson(e));
  }
}

function getExecutionLog(el) {
  return el || {
    step: 0
  };
}

function unwrapResults(isList, results) {
  return isList ? results : results[0];
}

function getNextOutput(fn, input) {
  var op = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'next';

  var g = isGenerator(fn) ? fn.apply(null, input) : fn;

  var _g$op = g[op](input),
      output = _g$op.value,
      done = _g$op.done;

  return {
    output: output,
    isList: Array.isArray(output),
    done: done,
    fn2: g
  };
}

function processCommands(config, handlers, commands, el) {
  try {
    var pc = function pc(c, index) {
      return processCommand(config, handlers, c, el, index);
    };
    var promises = commands.map(pc);
    return Promise.all(promises);
  } catch (e) {
    return Promise.reject(e);
  }
}

function processCommand(config, handlers, command, el, index) {
  var start = Date.now();
  var result = void 0;
  try {
    result = handlers[command.type](command, { call: call, config: config, handlers: handlers });
  } catch (e) {
    result = Promise.reject(e);
  }
  return toPromise(result).then(function (r) {
    var end = Date.now();
    report({
      success: true,
      config: config,
      command: command,
      step: el.step,
      index: index,
      result: r,
      start: start,
      end: end
    });
    return r;
  }).catch(function (e) {
    var end = Date.now();
    report({
      success: false,
      config: config,
      command: command,
      step: el.step,
      index: index,
      result: errorToJson(e),
      start: start,
      end: end
    });
    throw e;
  });
}

function report(_ref) {
  var success = _ref.success,
      command = _ref.command,
      index = _ref.index,
      step = _ref.step,
      result = _ref.result,
      config = _ref.config,
      start = _ref.start,
      end = _ref.end;

  if (!config.onCommandComplete) return;
  var r = {
    success: success,
    command: command,
    latency: end - start,
    start: start,
    end: end,
    index: index,
    step: step,
    result: result,
    config: config
  };
  config.onCommandComplete(r);
}

module.exports = {
  call: call
};
//# sourceMappingURL=index.js.map