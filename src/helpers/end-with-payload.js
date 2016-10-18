const { panic, setPayload } = require('../actions')

function endWithPayload (key, defaultValue) {
  const shouldPanic = defaultValue === undefined
  return function ({context, errors}) {
    if (errors[key]) {
      if (shouldPanic) {
        return panic(errors[key])
      } else {
        return [setPayload(defaultValue)]
      }
    } else {
      return setPayload(context[key])
    }
  }
}

module.exports = {
  endWithPayload
}
