const {
  addIndex,
  append,
  curry,
  filter,
  fromPairs,
  has,
  keys,
  map,
  merge,
  mergeAll,
  pick,
  pipe,
  prop,
  props,
  toPairs,
  zip
} = require('ramda')
const simpleProtocol = require('simple-protocol-helpers')

const isArray = Array.isArray
const isPromise = v => v && v.then

const toArray = a => (isArray(a) ? a : [a])
const toPromise = v => (isPromise(v) ? v : Promise.resolve(v))

const unwrapArray = a => (a.length === 1 ? a[0] : a)
const unwrapArgs = a => (isArray(a) ? unwrapArray(a) : a)

function asyncify(action) {
  return merge(action, {
    asyncAction: true
  })
}

module.exports = merge(simpleProtocol, {
  addIndex,
  append,
  asyncify,
  curry,
  filter,
  fromPairs,
  has,
  keys,
  map,
  merge,
  mergeAll,
  pick,
  pipe,
  prop,
  props,
  toArray,
  toPairs,
  toPromise,
  unwrapArgs,
  unwrapArray,
  zip
})
