const { panic } = require('../../actions')

function p1 () {
  return panic(new Error('Something bad happened!'))
}

module.exports = {
  testPanic: p1
}
