'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _require = require('ramda');

var map = _require.map;
var insert = _require.insert;
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

var _require5 = require('./helpers/result-to-context');

var resultToContext = _require5.resultToContext;

var _require6 = require('./helpers/result-to-payload');

var resultToPayload = _require6.resultToPayload;

var _require7 = require('./helpers/end-with-payload');

var endWithPayload = _require7.endWithPayload;

var _require8 = require('./helpers/end-with-payload-if-truthy');

var endWithPayloadIfTruthy = _require8.endWithPayloadIfTruthy;

var _require9 = require('./helpers/pick-payload');

var pickPayload = _require9.pickPayload;

var _require10 = require('./helpers/pick-context');

var pickContext = _require10.pickContext;

var _require11 = require('./helpers/pick-errors');

var pickErrors = _require11.pickErrors;

var _require12 = require('./helpers/validate-exists');

var validateExists = _require12.validateExists;

var _require13 = require('./helpers/panic-if-error');

var panicIfError = _require13.panicIfError;

var actions = require('./actions');

var run = function run(plugins, pipeRaw, state, parentEC) {
  var pipe = normalizePipe(pipeRaw);
  var ec = newExecutionContext(pipe, parentEC);
  var state1 = normalizeState(state);
  var allPlugins = merge(defaultPlugins, plugins);
  return runRecursive(allPlugins, state1, ec);
};

var runRecursive = function runRecursive(plugins, state, ec) {
  if (isEndOfPipe(ec)) {
    return Promise.resolve(state);
  }

  var fn = pipeFn(ec);
  var result = fn(state);
  var results = toArray(result);

  return runActions(plugins, results, ec).then(function (actions) {
    var state1 = stateReducer(state, actions);
    var ec1 = incrementECIndex(ec);
    var controlFlowAction = findControlFlowAction(actions);
    var ec2 = applyControlFlowAction(controlFlowAction, ec1);

    if (ec2.flow === 'end') {
      return state1;
    }

    return runRecursive(plugins, state1, ec2);
  });
};

var findControlFlowAction = function findControlFlowAction(actions) {
  var controlFlowActionTypes = ['end', 'interpolate'];
  return actions.find(function (_ref) {
    var type = _ref.type;
    return controlFlowActionTypes.indexOf(type) > -1;
  });
};

var applyControlFlowAction = function applyControlFlowAction() {
  var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ec = arguments[1];

  switch (action.type) {
    case 'end':
      return merge(ec, {
        flow: 'end'
      });

    case 'interpolate':
      var newPipe = insert(ec.index, action.pipe, ec.pipe);
      return modifyPipe(ec, flatten(newPipe));

    default:
      return merge(ec, {
        flow: 'continue'
      });
  }
};

var newExecutionContext = function newExecutionContext(pipe, parent) {
  return {
    index: 0,
    parent: parent,
    pipe: pipe
  };
};

var incrementECIndex = function incrementECIndex(ec) {
  return merge(ec, {
    index: ec.index + 1
  });
};

var modifyPipe = function modifyPipe(ec, pipe) {
  return merge(ec, {
    originalPipe: ec.pipe,
    pipe: pipe
  });
};

var runActions = function runActions(plugins, actions, ec) {
  var promises = map(function (action) {
    return plugins[action.type](plugins, action, ec);
  }, actions);
  return Promise.all(promises);
};

var stateActionHandler = function stateActionHandler(plugins, action) {
  return action;
};

var callActionHandler = function callActionHandler(plugins, action, ec) {
  return run(plugins, action.pipe, action.state, ec).then(function (state) {
    return addToContext(keyed(action.contextKey, state));
  });
};

var mapPipeActionHandler = function mapPipeActionHandler(plugins, action, ec) {
  var mapResults = map(function (s) {
    return run(plugins, action.pipe, s, ec);
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
  panic: panicActionHandler,
  interpolate: stateActionHandler
};

var resultToStateAction = function resultToStateAction(action, pluginResult) {
  return toPromise(pluginResult).then(function (payload) {
    return addToContext(keyed(action.contextKey, payload));
  }).catch(function (error) {
    return addToErrors(keyed(action.contextKey, error));
  });
};

var isEndOfPipe = function isEndOfPipe(ec) {
  return ec.index >= ec.pipe.length;
};

var pipeFn = function pipeFn(ec) {
  return ec.pipe[ec.index];
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
  return reduce(function (p, _ref2) {
    var _ref3 = _slicedToArray(_ref2, 2);

    var key = _ref3[0];
    var pipe = _ref3[1];

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

var exported = {
  emptyState: emptyState,
  run: run,
  normalizePipe: normalizePipe,
  normalizeState: normalizeState,
  setup: setup,
  simplePlugin: simplePlugin,
  resultToContext: resultToContext,
  resultToPayload: resultToPayload,
  endWithPayload: endWithPayload,
  endWithPayloadIfTruthy: endWithPayloadIfTruthy,
  pickPayload: pickPayload,
  pickContext: pickContext,
  pickErrors: pickErrors,
  validateExists: validateExists,
  panicIfError: panicIfError
};

module.exports = merge(actions, exported);
//# sourceMappingURL=effects-as-data.js.map