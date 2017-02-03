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
const simpleProtocol = require('simple-protocol-helpers')

const isArray = Array.isArray
const isPromise = v => v && v.then

const toArray = a => isArray(a) ? a : [a]
const toPromise = v => isPromise(v) ? v : Promise.resolve(v)

const unwrapArray = a => a.length === 1 ? a[0] : a
const unwrapArgs = a => isArray(a) ? unwrapArray(a) : a

module.exports = merge(simpleProtocol, {
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
  merge
})
