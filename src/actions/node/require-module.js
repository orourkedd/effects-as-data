function requireModule (path) {
  return {
    type: 'requireModule',
    path
  }
}

module.exports = {
  requireModule
}
