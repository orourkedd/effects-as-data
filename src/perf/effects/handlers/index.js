const { promisify } = require("util");
const fs = require("fs");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

function readFile({ path, options }) {
  return readFileAsync(path, options);
}

function writeFile({ path, content, options }) {
  return writeFileAsync(path, content, options);
}

function now() {
  return Date.now();
}

module.exports = {
  readFile,
  writeFile,
  now
};
