function toArray (a) {
  if (typeof a === 'undefined') {
    return []
  } else if (Array.isArray(a)) {
    return a
  } else {
    return [a]
  }
}

function toPromise (v) {
  if (!v || !v.then) {
    return Promise.resolve(v)
  }

  return v
}

module.exports = {
  toArray,
  toPromise
}
