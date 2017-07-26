function errorToJson(e) {
  const props = Object.getOwnPropertyNames(e).concat('name')
  return props.reduce((p, c) => {
    p[c] = e[c]
    return p
  }, {})
}

function expectError(e1, e2) {
  const ne1 = typeof e1 === 'string' ? new Error(e1) : e1
  const ne2 = typeof e2 === 'string' ? new Error(e2) : e2
  const be1 = get(() => e2.constructor.name) ? errorToJson(ne1) : ne1
  const be2 = get(() => e1.constructor.name) ? errorToJson(ne2) : ne2
  const oe1 = omitStack(be1)
  const oe2 = omitStack(be2)
  expect(oe1).toEqual(oe2)
}

function omitStack(s) {
  delete s.stack
  return s
}

function get(fn) {
  try {
    return fn()
  } catch (e) {
    return undefined
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

module.exports = {
  expectError,
  sleep
}
