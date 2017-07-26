'use strict';

function readFile(path, options) {
  return {
    type: 'readFile',
    path: path,
    options: options
  };
}

function writeFile(path, content, options) {
  return {
    type: 'writeFile',
    path: path,
    content: content,
    options: options
  };
}

function now() {
  return {
    type: 'now'
  };
}

module.exports = {
  readFile: readFile,
  writeFile: writeFile,
  now: now
};
//# sourceMappingURL=index.js.map