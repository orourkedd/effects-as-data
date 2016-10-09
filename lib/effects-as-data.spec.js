'use strict';

var _require = require('./effects-as-data');

var runAction = _require.runAction;
var runActions = _require.runActions;
var emptyState = _require.emptyState;
var run = _require.run;
var normalizePipe = _require.normalizePipe;
var normalizeState = _require.normalizeState;
var setup = _require.setup;
var simplePlugin = _require.simplePlugin;

var _require2 = require('sinon');

var stub = _require2.stub;

var assert = require('chai').assert;
var deep = assert.deepEqual;

var _require3 = require('./test/plugins/test1');

var test1Plugin = _require3.test1Plugin;
var test1 = _require3.test1;

var _require4 = require('./test/pipes/test1');

var test1Pipe = _require4.test1Pipe;

var _require5 = require('./test/pipes/test-call');

var testCall = _require5.testCall;

var _require6 = require('./test/pipes/test-map');

var testMap = _require6.testMap;

var _require7 = require('./test/pipes/test-panic');

var testPanic = _require7.testPanic;

var _require8 = require('./test/pipes/test-end');

var testEnd = _require8.testEnd;

var _require9 = require('./actions');

var addToContext = _require9.addToContext;

var _require10 = require('./plugins/log');

var logPlugin = _require10.logPlugin;
var log = _require10.log;

var _require11 = require('./test/pipes/double-call');

var doubleCall = _require11.doubleCall;

var _require12 = require('./test/pipes/pass-payload');

var passPayload = _require12.passPayload;

var _require13 = require('./test/pipes/child-ec');

var childEC = _require13.childEC;

var _require14 = require('ramda');

var merge = _require14.merge;

describe('effects-as-data', function () {
  describe.skip('runAction', function () {
    it('should write results to the context object', function () {
      var _setupEAD = setupEAD('test-result1');

      var action1 = _setupEAD.action1;
      var plugins = _setupEAD.plugins;

      return runAction(plugins, action1).then(function (result) {
        assert(plugins.test1.calledWith(action1.payload), 'plugin was not called with action payload');
        deep(result.success, true);
        deep(result.payload, 'test-result1');
      });
    });

    it('should write errors to the error object', function () {
      var error = new Error('nope');
      var plugins = {
        test1: function test1() {
          return Promise.reject(error);
        }
      };

      var action = test1('result');

      return runAction(plugins, action).then(function (result) {
        deep(result.success, false);
        deep(result.error, error);
      });
    });

    it('should throw if plugin is not registered', function () {
      var action = {
        type: 'notRegistered'
      };

      try {
        runAction({}, action);
      } catch (e) {
        deep(e.message, '"notRegistered" is not a registered plugin.');
        return;
      }

      throw new Error('Exception was not thrown.');
    });
  });

  describe.skip('runActions', function () {
    it('should run multiple actions and return an array of results', function () {
      var _setupEAD2 = setupEAD('test-result1', 'test-result2');

      var plugins = _setupEAD2.plugins;

      var action1 = testAction('test1', 'tr1');
      var action2 = testAction('test2', 'tr2');
      var actions = [action1, action2];
      return runActions(plugins, actions).then(function (result) {
        deep(result, {
          context: {
            tr1: 'test-result1',
            tr2: 'test-result2'
          },
          errors: {}
        });
      });
    });
  });

  describe('emptyState', function () {
    it('return an empty state object', function () {
      deep(emptyState(), {
        context: {},
        payload: {},
        errors: {}
      });
    });
  });

  describe('setup', function () {
    it('should be able to run a pipe', function () {
      var plugins = {
        test1: test1Plugin
      };

      var pipes = {
        test1: test1Pipe
      };

      var _setup = setup(plugins, pipes);

      var test1 = _setup.test1;

      return test1().then(function (state) {
        deep(state.payload, {
          result: 'test1-result'
        });
      });
    });
  });

  describe('run', function () {
    it('should be able to run a pipe', function () {
      var plugins = {
        test1: test1Plugin
      };

      return run(plugins, test1Pipe, emptyState()).then(function (state) {
        deep(state.payload, {
          result: 'test1-result'
        });
      });
    });

    it('should pass the payload through the pipe', function () {
      var payload = {
        foo: 'bar'
      };

      return run({}, passPayload, payload).then(function (state) {
        deep(state.payload, payload);
      });
    });

    it('should pass the context through the pipe', function () {
      var expectedState = merge(emptyState(), {
        context: {
          foo: 'bar'
        }
      });

      return run({}, passPayload, expectedState).then(function (state) {
        deep(state.context, expectedState.context);
      });
    });

    it('should pass the errors through the pipe', function () {
      var expectedState = merge(emptyState(), {
        errors: {
          foo: new Error('foo!')
        }
      });

      return run({}, passPayload, expectedState).then(function (state) {
        deep(state.errors, expectedState.errors);
      });
    });

    it('should write errors to the error object', function () {
      var error = new Error('nope');
      var plugins = {
        test1: simplePlugin(function () {
          return Promise.reject(error);
        })
      };

      var action = test1('result');

      var fn = function fn() {
        return action;
      };

      return run(plugins, fn, emptyState()).then(function (state) {
        deep(state.errors[action.contextKey], error);
      });
    });

    it('should perform all actions before returning', function () {
      return run({}, doubleCall, emptyState()).then(function (state) {
        deep(state.payload, {
          c1: true,
          c2: true
        });
      });
    });

    it('should correctly pass the execution context to a child pipe', function () {
      return run({}, childEC, emptyState()).then(function (_ref) {
        var payload = _ref.payload;

        deep(payload.value, 12);
      });
    });

    describe('call', function () {
      it('should call subpipe', function () {
        var _setupEAD3 = setupEAD();

        var plugins = _setupEAD3.plugins;

        var expectedState = {
          foo: 'bar',
          sub: 'pipe'
        };

        return run(plugins, testCall, expectedState).then(function (state) {
          deep(state.payload, expectedState);
        });
      });
    });

    describe('mapPipe', function () {
      it('should be able to map a pipe over results', function () {
        var _setupEAD4 = setupEAD();

        var plugins = _setupEAD4.plugins;

        return run(plugins, testMap, {}).then(function (state) {
          var expectedPayload = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }];

          deep(state.payload.map(function (s) {
            return s.payload;
          }), expectedPayload);
        });
      });
    });

    describe('panic', function () {
      it('should error out on panic', function () {
        var _setupEAD5 = setupEAD();

        var plugins = _setupEAD5.plugins;

        return run(plugins, testPanic, {}).then(function (state) {
          throw new Error('This should not be called');
        }).catch(function (err) {
          deep(err.message, 'Something bad happened!');
        });
      });
    });

    describe('end', function () {
      it('should be able to abort pipe', function () {
        var _setupEAD6 = setupEAD();

        var plugins = _setupEAD6.plugins;

        return run(plugins, testEnd, {}).then(function (_ref2) {
          var payload = _ref2.payload;

          deep(payload, 2);
        });
      });
    });

    describe('addToContext', function () {
      it('should add to context', function () {
        var _setupEAD7 = setupEAD();

        var plugins = _setupEAD7.plugins;

        var added = {
          foo: 'bar'
        };

        var fn = function fn() {
          return addToContext(added);
        };

        return run(plugins, fn, {}).then(function (_ref3) {
          var context = _ref3.context;

          deep(context, added);
        });
      });

      it('should allow multiple addToContext actions', function () {
        var pipe = [];

        pipe.push(function () {
          return addToContext({
            one: 1
          });
        });

        pipe.push(function () {
          return addToContext({
            two: 2
          });
        });

        return run({}, pipe, emptyState()).then(function (state) {
          deep(state.context, {
            one: 1,
            two: 2
          });
        });
      });
    });
  });

  describe('normalizePipe', function () {
    it('should normalizePipe pipe to a flat array', function () {
      var fn1 = function fn1() {};
      var fn2 = function fn2() {};
      var fn3 = function fn3() {};

      deep(normalizePipe(fn1), [fn1]);
      deep(normalizePipe([fn1, [fn2, fn3]]), [fn1, fn2, fn3]);
      deep(normalizePipe([fn1, fn2, fn3]), [fn1, fn2, fn3]);
    });
  });

  describe('logPlugin', function () {
    it('should console.log message', function () {
      var plugins = {
        log: logPlugin
      };

      var fn = function fn() {
        return log('hi');
      };

      stub(console, 'info');
      return run(plugins, fn, {}).then(function () {
        assert(console.info.calledWith('hi'), 'console.info was not called with "hi"');
        console.info.restore();
      }).catch(function (e) {
        console.info.restore();
        throw e;
      });
    });
  });

  describe('normalizeState', function () {
    it('should convert value to state object', function () {
      var state = normalizeState(1);
      deep(state, {
        context: {},
        payload: 1,
        errors: {}
      });
    });

    it('should not change state object', function () {
      var s1 = {
        context: {},
        payload: 1,
        errors: {}
      };

      var state = normalizeState(s1);
      deep(state, s1);
    });

    it('should return an empty state if value is falsey', function () {
      var state = normalizeState();
      deep(state, emptyState());
    });
  });
});

function setupEAD(testPluginResult1, testPluginResult2) {
  var action1 = testAction('test1');
  var action2 = testAction('test2');
  var plugins = {
    test1: stub().returns(Promise.resolve(testPluginResult1)),
    test2: stub().returns(Promise.resolve(testPluginResult2))
  };

  var state = emptyState();

  return { action1: action1, action2: action2, state: state, plugins: plugins };
}

function testAction() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'test';
  var contextKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'testResult';

  return {
    type: type,
    contextKey: contextKey,
    payload: {
      foo: 'bar'
    }
  };
}
//# sourceMappingURL=effects-as-data.spec.js.map