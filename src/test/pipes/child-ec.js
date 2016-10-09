const { mapPipe, setPayload } = require('../../actions')
const { map, reduce } = require('ramda')

function a () {}

function b () {
  return mapPipe('value', subEC, [{value: 1}, {value: 1}, {value: 1}])
}

function c ({context}) {
  let results = map(({payload}) => payload.value, context.value)
  let sum = reduce((p, c) => p + c, 0, results)
  return setPayload({
    value: sum
  })
}

function subA ({payload}) {
  return setPayload({
    value: payload.value + 1
  })
}

function subB ({payload}) {
  return setPayload({
    value: payload.value + 1
  })
}

function subC ({payload}) {
  return setPayload({
    value: payload.value + 1
  })
}

const childEC = [a, a, b, c]
const subEC = [subA, subB, subC]

module.exports = {
  childEC
}
