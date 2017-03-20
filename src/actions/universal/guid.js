/**
 * Creates a `guid` action.  `yield` a `guid` action to get a shiny new guid.
 * @returns {Object} an action of type `guid`.
 */
function guid () {
  return {
    type: 'guid'
  }
}

module.exports = {
  guid
}
