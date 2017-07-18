function die(message = '') {
  return {
    type: 'die',
    message
  }
}

module.exports = {
  die
}
