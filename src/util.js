const {
  curry,
  map,
  prop,
  pick,
  zip,
  has,
  merge,
  props,
  append,
  filter
} = require('ramda')

const hasSuccess             = has('success')
const hasPayload             = has('payload')
const hasError               = has('error')
const isArray                = Array.isArray
const isString               = s => typeof s === 'string'
const isPromise              = v => !v || !v.then
const isProtocol             = p => p ? hasSuccess(p) && (hasPayload(p) || hasError(p)) : false
const isSuccess              = p => p.success === true
const isFailure              = p => p.success === false
const clean                  = p => pick(['success', 'error', 'payload'], p)

const toError                = e => isString(e) ? { message: e } : e
const toArray                = a => isArray(a) ? a : [a]
const toPromise              = v => isPromise(v) ? Promise.resolve(v) : v

const S                      = { success: true }
const success                = (payload = null) => Object.assign({}, S, { payload })
const F                      = { success: false }
const failure                = (e = null) => Object.assign({}, F, { error: toError(e)})

const isError                = e => e instanceof Error
const errorProps             = e => Object.getOwnPropertyNames(e).concat('name')
const errorToObject          = e => isError(e) ? pick(errorProps(e), e) : e

const unwrapArray            = a => a.length === 1 ? a[0] : a
const unwrapArgs             = a => isArray(a) ? unwrapArray(a) : a
const getSuccesses           = l => filter(isSuccess, l)
const getFailures            = l => filter(isFailure, l)
const normalize              = (fn, p) => isProtocol(p) ? p : fn(p)
const normalizeToSuccess     = p => normalize(success, p)
const normalizeToFailure     = p => normalize(failure, p)
const normalizeListToSuccess = map(normalizeToSuccess)

module.exports = {
  unwrapArgs,
  unwrapArray,
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
  isProtocol,
  clean,
  errorToObject
}
