function echo (payload) {
  return {
    type: 'echo',
    payload
  }
}

module.exports = {
  echo
}
