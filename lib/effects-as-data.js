'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _require = require('ramda');

var map = _require.map;
var merge = _require.merge;
var flatten = _require.flatten;
var reduce = _require.reduce;
var toPairs = _require.toPairs;

var _require2 = require('./util');

var toArray = _require2.toArray;
var toPromise = _require2.toPromise;
var keyed = _require2.keyed;

var _require3 = require('./state-reducer');

var stateReducer = _require3.stateReducer;

var _require4 = require('./actions');

var addToContext = _require4.addToContext;
var addToErrors = _require4.addToErrors;

var run = function run(plugins, pipeRaw, state) {
  var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var allPlugins = merge(defaultPlugins, plugins);
  return runRecursive(allPlugins, pipeRaw, state, index);
};

var runRecursive = function runRecursive(plugins, pipeRaw, state) {
  var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var state1 = normalizeState(state);
  var pipe = normalizePipe(pipeRaw);

  if (isEndOfPipe(pipe, index)) {
    return Promise.resolve(state1);
  }

  var fn = pipeFn(pipe, index);
  var result = fn(state1);
  var results = toArray(result);

  return runActions(plugins, results).then(function (actions) {
    var state2 = stateReducer(state1, actions);
    var shouldEnd = actions.some(function (a) {
      return a.type === 'end';
    });
    return shouldEnd ? state2 : runRecursive(plugins, pipe, state2, index + 1);
  });
};

var runActions = function runActions(plugins, actions) {
  var promises = map(function (action) {
    return plugins[action.type](plugins, action);
  }, actions);
  return Promise.all(promises);
};

var stateActionHandler = function stateActionHandler(plugins, action) {
  return action;
};

var callActionHandler = function callActionHandler(plugins, action) {
  return runRecursive(plugins, action.pipe, action.state).then(function (state) {
    return addToContext(keyed(action.contextKey, state));
  });
};

var mapPipeActionHandler = function mapPipeActionHandler(plugins, action) {
  var mapResults = map(function (s) {
    return runRecursive(plugins, action.pipe, s);
  }, action.state);

  return Promise.all(mapResults).then(function (results) {
    return addToContext(keyed(action.contextKey, results));
  });
};

var panicActionHandler = function panicActionHandler(plugins, action) {
  return Promise.reject(action.error);
};

var defaultPlugins = {
  setPayload: stateActionHandler,
  addToErrors: stateActionHandler,
  addToContext: stateActionHandler,
  end: stateActionHandler,
  call: callActionHandler,
  mapPipe: mapPipeActionHandler,
  panic: panicActionHandler
};

var resultToStateAction = function resultToStateAction(action, pluginResult) {
  return toPromise(pluginResult).then(function (payload) {
    return addToContext(keyed(action.contextKey, payload));
  }).catch(function (error) {
    return addToErrors(keyed(action.contextKey, error));
  });
};

var isEndOfPipe = function isEndOfPipe(pipe, i) {
  return i >= pipe.length;
};

var pipeFn = function pipeFn(pipe, i) {
  return pipe[i];
};

var normalizeState = function normalizeState(state) {
  if (!state) {
    return emptyState();
  }

  if (state.context && state.errors && state.payload) {
    return state;
  }

  return merge(emptyState(), {
    payload: state
  });
};

var normalizePipe = function normalizePipe(pipe) {
  var pipeAsArray = toArray(pipe);
  return flatten(pipeAsArray);
};

var emptyState = function emptyState() {
  return {
    context: {},
    payload: {},
    errors: {}
  };
};

var setup = function setup(plugins, pipes) {
  var pairs = toPairs(pipes);
  return reduce(function (p, _ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var key = _ref2[0];
    var pipe = _ref2[1];

    p[key] = function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return run(plugins, pipe, state);
    };
    return p;
  }, {}, pairs);
};

var simplePlugin = function simplePlugin(fn) {
  return function (plugins, action) {
    var result = fn(action.payload);
    return resultToStateAction(action, result);
  };
};

module.exports = {
  emptyState: emptyState,
  run: run,
  normalizePipe: normalizePipe,
  normalizeState: normalizeState,
  setup: setup,
  simplePlugin: simplePlugin
};
//# sourceMappingURL=effects-as-data.js.map