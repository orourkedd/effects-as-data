function randomNumberFn(random) {
  return random()
}

module.exports = {
  randomNumberFn,
  randomNumber: action => randomNumberFn(Math.random, action),
}
