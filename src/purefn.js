function runAction (plugins, action) {
  let plugin = plugins[action.type]
  return plugin(action.payload)
}

function emptyState () {
  return {
    context: {},
    payload: {},
    errors: {}
  }
}

module.exports = {
  runAction,
  emptyState
}
