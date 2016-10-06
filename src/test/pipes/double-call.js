const { call, setPayload } = require('../../actions')
const { merge } = require('ramda')

function doubleCall1 () {
  let s1 = call('c1', c1)
  let s2 = call('c2', c2)
  return [s1, s2]
}

function doubleCall2 ({context}) {
  return setPayload(merge(
    context.c1.payload,
    context.c2.payload
  ))
}

function c1 () {
  return setPayload({
    c1: true
  })
}

function c2 () {
  return setPayload({
    c2: true
  })
}

module.exports = {
  doubleCall: [doubleCall1, doubleCall2]
}
