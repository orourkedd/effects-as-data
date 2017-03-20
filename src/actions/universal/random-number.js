/**
 * Create an `randomNumber` action.  `yield` a `randomNumber` to get a random number using `Math.random()`.
 * @returns {Object} an action of type `randomNumber`.
 */
function randomNumber () {
  return {
    type: 'randomNumber'
  }
}

module.exports = {
  randomNumber
}
