const { betterError } = require('../util')

function expectError(e1, e2) {
  const ne1 = typeof e1 === 'string' ? new Error(e1) : e1
  const ne2 = typeof e2 === 'string' ? new Error(e2) : e2
  const be1 = get(() => e2.constructor.name) ? betterError(ne1) : ne1
  const be2 = get(() => e1.constructor.name) ? betterError(ne2) : ne2
  expect(omitStack(be1)).toEqual(omitStack(be2))
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