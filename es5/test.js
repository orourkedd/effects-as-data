'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var assert = require('assert');
var curry = require('lodash/curry');
var chunk = require('lodash/chunk');

var testRunner = function testRunner(fn, expected) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var previousOutput = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  checkForExpectedTypeMismatches(expected);

  assert(fn, 'The function you are trying to test is undefined.');

  var step = expected[index];

  if (step === undefined) {
    throw new Error('Your spec does not have as many steps as your function.  Are you missing a return line?');
  }

  var _step = _slicedToArray(step, 2),
      input = _step[0],
      expectedOutput = _step[1];

  var g = void 0;
  if (fn.next) {
    g = fn;
  } else {
    g = fn.apply(null, input);
  }

  var output = void 0;
  if (isError(input)) {
    try {
      output = g.throw(input);
    } catch (e) {
      output = { value: e, done: true };
    }
  } else {
    output = g.next(input);
  }

  try {
    deepEqual(output.value, expectedOutput);
  } catch (e) {
    e.name = 'Error on Step ' + (index + 1);
    throw e;
  }

  if (!output.done || index + 1 < expected.length) {
    testRunner(g, expected, index + 1, output.value);
  }
};

function isError(e) {
  if (!e) return false;
  return e instanceof Error;
}

var checkForExpectedTypeMismatches = function checkForExpectedTypeMismatches(expected) {
  if (!Array.isArray(expected)) {
    throw new Error('Your spec must return an array of tuples.  It is currently returning a value of type "' + (typeof expected === 'undefined' ? 'undefined' : _typeof(expected)) + '".');
  }
  for (var i = 0; i < expected.length; i++) {
    if (i + 1 >= expected.length) return;
    var output = expected[i][1];
    var nextInput = expected[i + 1][0];

    if (Array.isArray(output)) {
      assert(Array.isArray(nextInput), 'If an array of actions is yielded, it should return an array of results.');
    }
  }
};

var testFn = function testFn(fn, spec) {
  return function () {
    var expectedLog = spec();
    testRunner(fn, expectedLog);
  };
};

var testFnV2 = function testFnV2(fn, spec) {
  return function () {
    var expectedLog = spec();
    var flat = expectedLog.reduce(function (p, step, index, log) {
      if (index === 0 || index === log.length - 1) {
        p.push(step);
        return p;
      }

      p.push(step[0]);
      p.push(step[1]);
      return p;
    }, []);
    var v1Log = chunk(flat, 2);
    testRunner(fn, v1Log);
  };
};

function deepEqual(actual, expected) {
  //  a little bit of jest support
  if (typeof expect !== 'undefined' && expect.extend && expect.anything) {
    expect(actual).toEqual(expected);
  } else {
    assert.deepEqual(actual, expected);
  }
}

// Semantic test builder
var args = function args() {
  for (var _len = arguments.length, fnArgs = Array(_len), _key = 0; _key < _len; _key++) {
    fnArgs[_key] = arguments[_key];
  }

  var t = [[fnArgs]];
  return { yieldCmd: yieldCmd(t), returns: returns(t) };
};

var yieldCmd = curry(function (t, v) {
  t[t.length - 1][1] = v;
  return {
    yieldReturns: yieldReturns(t)
  };
});

var yieldReturns = curry(function (t, v) {
  t[t.length] = [v];

  return {
    yieldCmd: yieldCmd(t),
    returns: returns(t)
  };
});

var returns = curry(function (t, a) {
  t[t.length - 1][1] = a;
  return t;
});

// Modified tuples
function alt() {}

module.exports = {
  testRunner: testRunner,
  testFn: curry(testFn, 2),
  testFnV2: curry(testFnV2, 2),
  alt: alt,
  args: args
};
//# sourceMappingURL=test.js.map