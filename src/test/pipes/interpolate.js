const { setPayload, addToContext, interpolate } = require('../../actions')

function a ({payload}) {
  return addToContext({
    value: 1,
    doInterpolation: payload.doInterpolation
  })
}

function b ({context}) {
  return addToContext({
    value: context.value + 1
  })
}

function c ({context}) {
  let actions = []
  let a1 = addToContext({
    value: context.value + 1
  })
  actions.push(a1)

  if (context.doInterpolation) {
    let a2 = interpolate(addExtra)
    actions.push(a2)
  }

  return actions
}

function d ({context}) {
  return setPayload(context)
}

function ai ({context}) {
  return addToContext({
    value: context.value + 1
  })
}

function bi ({context}) {
  return addToContext({
    value: context.value + 1
  })
}

const addExtra = [ai, bi]

module.exports = {
  interpolationTest: [a, b, c, d]
}
