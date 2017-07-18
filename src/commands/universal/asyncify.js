function asyncify(cmd) {
  return {
    type: 'asyncify',
    cmd
  }
}

module.exports = {
  asyncify
}
