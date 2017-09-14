const assert = require('assert')

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

function deepEqual(actual, expected) {
  const a = normalizeError(actual)
  const e = normalizeError(expected)
  if (usingJest()) expect(a).toEqual(e)
  else assert.deepEqual(a, e)
}

function normalizeError(v) {
  const isError = v instanceof Error
  if (!isError) return v
  const props = Object.getOwnPropertyNames(v).concat('name')
  return props.reduce((p, c) => {
    if (c === 'stack') return p
    p[c] = v[c]
    return p
  }, {})
}

function usingJest() {
  return typeof expect !== 'undefined' && expect.extend && expect.anything
}

module.exports = {
  expectError,
  sleep,
  deepEqual
}
