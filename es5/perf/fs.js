'use strict';

var _require = require('../index'),
    call = _require.call;

var handlers = require('./effects/handlers');

var _require2 = require('./effects/functions'),
    eadBenchmark = _require2.eadBenchmark;

var _require3 = require('./standard'),
    standardBenchmark = _require3.standardBenchmark;

var iterations = 1000 * 50;

var filePath = '/tmp/perf.txt';

async function testStandard() {
  var start = Date.now();
  for (var i = 0; i < iterations; i++) {
    await standardBenchmark(filePath);
  }
  var end = Date.now();
  return end - start;
}

async function testEAD() {
  var start = Date.now();
  for (var i = 0; i < iterations; i++) {
    await call({}, handlers, eadBenchmark, filePath);
  }
  var end = Date.now();
  return end - start;
}

async function benchmark() {
  console.log('Wait while operation runs 50,000 times...');
  var standard = await testStandard();
  var ead = await testEAD();
  var diff = ead - standard;
  var perTransaction = diff / iterations;
  var microSecondsPerTransaction = (perTransaction * 1000).toFixed(2);
  console.log('Differnce for ' + iterations + ' transactions: ' + diff + 'ms');
  console.log('Differnce per transaction: ' + microSecondsPerTransaction + '\u03BCs');
}

benchmark().catch(console.error);
//# sourceMappingURL=fs.js.map