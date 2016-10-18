const { setPayload, panic, end } = require('../actions')

function endWithPayloadIfTruthy (key, panicOnError = true) {
  return function ({context, errors}) {
    let error = errors[key]
    if (panicOnError && error) {
      return panic(error)
    } else if (error) {
      //  log error using action
      console.error(error)
    }

    if (context[key]) {
      return [setPayload(context[key]), end()]
    }
  }
}

module.exports = {
  endWithPayloadIfTruthy
}
