function panic (error) {
  if (typeof error === 'string') {
    error = new Error(error)
  }
  return {
    type: 'panic',
    error
  }
}

module.exports = {
  panic
}
