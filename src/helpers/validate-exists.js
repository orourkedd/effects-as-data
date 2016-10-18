const { panic } = require('../actions')

function validateExists (keys) {
  return function ({payload}) {
    let actions = keys.map((key) => {
      if (!payload[key]) {
        return panic(`${key} is required`)
      }
    })

    return actions.filter(v => v)
  }
}

module.exports = {
  validateExists
}
