const { panic } = require('../actions')

function panicIfError (key) {
  return function ({errors}) {
    if (errors[key]) {
      return panic(errors[key])
    }
  }
}

module.exports = {
  panicIfError
}
