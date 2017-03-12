function readFile (path, options) {
  return {
    type: 'node',
    module: 'fs',
    function: 'readFile',
    args: [path, options]
  }
}

function writeFile (path, data, options) {
  return {
    type: 'node',
    module: 'fs',
    function: 'writeFile',
    args: [path, data, options]
  }
}

module.exports = {
  readFile,
  writeFile
}
