const { call, buildFunctions } = require('../index')

// Pure business logic functions
function* getUsers() {
  return yield httpGet('http://example.com/api/users')
}

function* getUserPosts(userId) {
  return yield httpGet(`http://example.com/api/user/${userId}/posts`)
}

// HTTP Get command creator
function httpGet(url) {
  return {
    type: 'httpGet',
    url
  }
}

// Http Get command handler
function httpGetHandler(cmd) {
  // Fake http get handler simulating an API returning
  // an array of users
  return [
    {
      userId: 'foo'
    }
  ]
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
  { httpGet: httpGetHandler }, // command handlers
  { getUsers, getUserPosts } // effects-as-data functions
)

// Use the functions like you normally would
functions.getUsers().then(console.log)
