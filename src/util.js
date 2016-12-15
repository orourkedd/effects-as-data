const {
  curry,
  map,
  prop,
  pick,
  zip,
  has,
  merge,
  props,
  append
} = require('ramda')

const unwrapArgs = (a) => {
  if (!Array.isArray(a)) return a
  if (a.length === 1) {
    return a[0]
  } else {
    return a
  }
}

const toArray = (a) => {
  return Array.isArray(a) ? a : [a]
}

const toPromise = (v) => {
  if (!v || !v.then) {
    return Promise.resolve(v)
  }

  return v
}

function success (payload) {
  return {
    success: true,
    payload
  }
}

function isSuccess (p) {
  return p.success === true
}

function getSuccesses (l) {
  return l.filter((p) => p.success === true)
}

function failure (error) {
  return {
    success: false,
    error
  }
}

function isFailure (p) {
  return p.success === false
}

function getFailures (l) {
  return l.filter((p) => p.success === false)
}

const normalizeToSuccess = (p) => {
  if (isProtocol(p)) return p
  return success(p)
}

const normalizeListToSuccess = map(normalizeToSuccess)

const normalizeToFailure = (p) => {
  if (isProtocol(p)) return p
  return failure(p)
}

const isProtocol = (p) => {
  if (!p) return false
  const hasSuccess = has('success')
  const hasPayload = has('payload')
  const hasError = has('error')
  if (hasSuccess(p) && (hasPayload(p) || hasError(p))) return true
  return false
}

module.exports = {
  unwrapArgs,
  toArray,
  toPromise,
  curry,
  map,
  prop,
  pick,
  props,
  zip,
  has,
  append,
  success,
  isSuccess,
  getSuccesses,
  failure,
  isFailure,
  getFailures,
  merge,
  normalizeToSuccess,
  normalizeListToSuccess,
  normalizeToFailure,
  isProtocol
}
