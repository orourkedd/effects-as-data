'use strict';

var _require = require('../index'),
    call = _require.call;

var _require2 = require('./effects'),
    handlers = _require2.handlers,
    functions = _require2.functions,
    cmds = _require2.cmds;

var basicMultistep = functions.basicMultistep,
    badHandler = functions.badHandler;

var _require3 = require('./test-util'),
    sleep = _require3.sleep;

test('telemetry', async function () {
  var telemetry = [];
  var onCommandComplete = function onCommandComplete(t) {
    telemetry.push(t);
  };
  var config = { onCommandComplete: onCommandComplete, name: 'telemetry' };
  var now = Date.now();
  await call(config, handlers, basicMultistep, 'foo');
  expect(telemetry.length).toEqual(2);
  telemetry.forEach(function (t, i) {
    var message = 'foo' + (i + 1);
    expect(t.success).toEqual(true);
    expect(t.command).toEqual(cmds.echo(message));
    expect(t.latency).toBeLessThan(5);
    expect(t.start).toBeGreaterThanOrEqual(now);
    expect(t.end).toBeGreaterThanOrEqual(t.start);
    expect(t.index).toEqual(0);
    expect(t.step).toEqual(i);
    expect(t.result).toEqual(message);
    expect(t.config).toEqual(config);
  });
});

test('telemetry on error', async function () {
  var telemetry = void 0;
  var onCommandComplete = function onCommandComplete(t) {
    telemetry = t;
  };
  var config = { onCommandComplete: onCommandComplete, name: 'telemetry' };
  var now = Date.now();
  var message = 'oops';
  try {
    await call(config, handlers, badHandler, message);
  } catch (e) {}
  await sleep(10);
  expect(telemetry.success).toEqual(false);
  expect(telemetry.command).toEqual(cmds.die(message));
  expect(telemetry.latency).toBeLessThan(5);
  expect(telemetry.start).toBeGreaterThanOrEqual(now);
  expect(telemetry.end).toBeGreaterThanOrEqual(telemetry.start);
  expect(telemetry.index).toEqual(0);
  expect(telemetry.step).toEqual(0);
  expect(telemetry.result.message).toEqual('oops');
  expect(telemetry.config).toEqual(config);
});
//# sourceMappingURL=telemetry.spec.js.map