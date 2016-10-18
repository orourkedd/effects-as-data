'use strict';

var _require = require('../actions');

var addToContext = _require.addToContext;
var panic = _require.panic;

var _require2 = require('./result-to-context');

var resultToContext = _require2.resultToContext;

var assert = require('chai').assert;
var deep = assert.deepEqual;

describe('resultToContext', function () {
  it('should copy to result to context using map', function () {
    var r1 = 'value1';
    var r2 = 'value2';
    var context = {
      r1: r1,
      r2: r2
    };

    var expected = [addToContext({ v1: r1 }), addToContext({ v2: r2 })];

    var actual = resultToContext({
      r1: 'v1',
      r2: 'v2'
    })({ context: context, errors: {} });

    deep(actual, expected);
  });

  it('should panic if error', function () {
    var r1 = 'value1';
    var r2 = 'value2';
    var context = {
      r1: r1
    };

    var errors = {
      r2: r2
    };

    var expected = [addToContext({ v1: r1 }), panic(r2)];

    var actual = resultToContext({
      r1: 'v1',
      r2: 'v2'
    })({ context: context, errors: errors });

    deep(actual, expected);
  });
});
//# sourceMappingURL=result-to-context.spec.js.map