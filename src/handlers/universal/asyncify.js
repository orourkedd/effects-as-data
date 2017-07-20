const { call } = require('../../index')

const delay =
  typeof setImmediate === undefined ? fn => setTimeout(fn, 0) : setImmediate

function asyncify({ cmd }, config, handlers) {
  delay(() => {
    call(config, handlers, function*() {
      yield cmd
    })
  })
}

module.exports = {
  asyncify
}
