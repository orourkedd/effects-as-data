'use strict';

var _require = require('../actions');

var setPayload = _require.setPayload;
var panic = _require.panic;

var _require2 = require('./result-to-payload');

var resultToPayload = _require2.resultToPayload;

var assert = require('chai').assert;
var deep = assert.deepEqual;

describe('resultToPayload', function () {
  it('should copy to result to payload using map', function () {
    var r1 = 'value1';
    var r2 = 'value2';
    var context = {
      r1: r1,
      r2: r2
    };

    var expected = [setPayload({
      v1: r1,
      v2: r2,
      v3: 'value3'
    })];

    var actual = resultToPayload({
      r1: 'v1',
      r2: 'v2'
    })({ context: context, errors: {}, payload: { v3: 'value3' } });

    deep(actual, expected);
  });

  it('should copy to result to payload using array', function () {
    var r1 = 'value1';
    var r2 = 'value2';
    var context = {
      r1: r1,
      r2: r2
    };

    var expected = [setPayload({
      r1: r1,
      r2: r2,
      r3: 'value3'
    })];

    var actual = resultToPayload(['r1', 'r2'])({ context: context, errors: {}, payload: { r3: 'value3' } });

    deep(actual, expected);
  });

  it('should copy to result to payload using a string', function () {
    var r1 = 'value1';
    var r2 = 'value2';
    var context = {
      r1: r1,
      r2: r2
    };

    var expected = [setPayload({
      r1: r1,
      r3: 'value3'
    })];

    var actual = resultToPayload('r1')({ context: context, errors: {}, payload: { r3: 'value3' } });

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

    var expected = [panic(r2), setPayload({
      r1: r1,
      r3: 'value3'
    })];

    var actual = resultToPayload(['r1', 'r2'])({ context: context, errors: errors, payload: { r3: 'value3' } });

    deep(actual, expected);
  });
});
//# sourceMappingURL=result-to-payload.spec.js.map