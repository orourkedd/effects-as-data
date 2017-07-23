function readFile(path, options) {
  return {
    type: 'readFile',
    path,
    options
  }
}

function writeFile(path, content, options) {
  return {
    type: 'writeFile',
    path,
    content,
    options
  }
}

function now() {
  return {
    type: 'now'
  }
}

module.exports = {
  readFile,
  writeFile,
  now
}
