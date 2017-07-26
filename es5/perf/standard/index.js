'use strict';

var _require = require('util'),
    promisify = _require.promisify;

var fs = require('fs');
var readFileAsync = promisify(fs.readFile);
var writeFileAsync = promisify(fs.writeFile);

async function standardBenchmark(filePath) {
  var now = Date.now();
  await writeFileAsync(filePath, now.toString(), { encoding: 'utf8' });
  await readFileAsync(filePath, { encoding: 'utf8' });
}

module.exports = {
  standardBenchmark: standardBenchmark
};
//# sourceMappingURL=index.js.map