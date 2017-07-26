'use strict';

var _require = require('util'),
    promisify = _require.promisify;

var fs = require('fs');
var readFileAsync = promisify(fs.readFile);
var writeFileAsync = promisify(fs.writeFile);

function readFile(_ref) {
  var path = _ref.path,
      options = _ref.options;

  return readFileAsync(path, options);
}

function writeFile(_ref2) {
  var path = _ref2.path,
      content = _ref2.content,
      options = _ref2.options;

  return writeFileAsync(path, content, options);
}

function now() {
  return Date.now();
}

module.exports = {
  readFile: readFile,
  writeFile: writeFile,
  now: now
};
//# sourceMappingURL=index.js.map