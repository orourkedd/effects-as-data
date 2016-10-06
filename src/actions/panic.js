function panic (error) {
  return {
    type: 'panic',
    error
  }
}

module.exports = {
  panic
}
