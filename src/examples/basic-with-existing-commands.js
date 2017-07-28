const { call, buildFunctions } = require('../index')
const { cmds, handlers } = require('effects-as-data-universal')

// Pure business logic functions
function* getUsers() {
  return yield cmds.httpGet('http://example.com/api/users')
}

function* getUserPosts(userId) {
  return yield cmds.httpGet(`http://example.com/api/user/${userId}/posts`)
}

// Use onCommandComplete to gather telemetry
const config = {
  onCommandComplete: telemetry => {
    console.log('Telemetry:', telemetry)
  }
}

// Turn effects-as-data functions into normal,
// promise-returning functions
const functions = buildFunctions(
  config,
  handlers, // command handlers
  { getUsers, getUserPosts } // effects-as-data functions
)

// Use the functions like you normally would
functions.getUsers().then(console.log)
