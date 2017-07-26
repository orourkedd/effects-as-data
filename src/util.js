function isGenerator(fn) {
  return fn && fn.constructor && fn.constructor.name === 'GeneratorFunction'
}

function toArray(a) {
  return Array.isArray(a) ? a : [a]
}

const isPromise = v => v && v.then
const toPromise = v => (isPromise(v) ? v : Promise.resolve(v))

module.exports = {
  isGenerator,
  toArray,
  toPromise
}
