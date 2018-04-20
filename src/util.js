function toArray(a) {
  return Array.isArray(a) ? a : [a];
}

const isPromise = v => v && v.then;
const toPromise = v => (isPromise(v) ? v : Promise.resolve(v));

// istanbul ignore next
const delay =
  typeof setImmediate === undefined ? fn => setTimeout(fn, 0) : setImmediate;

module.exports = {
  toArray,
  toPromise,
  delay
};
