const { end, setPayload } = require('../../actions')

function one () {
  return setPayload(1)
}

function two () {
  return [setPayload(2), end()]
}

function three () {
  return setPayload(3)
}

module.exports = {
  testEnd: [one, two, three]
}
