function die({ message }) {
  throw new Error(message)
}

module.exports = {
  die
}
