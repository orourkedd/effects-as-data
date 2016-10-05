const { test1 } = require('../plugins/test1')
const { setPayload } = require('../../actions')

function t1 () {
  return test1('result')
}

function t2 ({context}) {
  return setPayload({
    result: context.result
  })
}

module.exports = {
  test1Pipe: [t1, t2]
}
