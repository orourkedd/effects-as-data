function toArray (a) {
  if (typeof a === 'undefined') {
    return []
  } else if (Array.isArray(a)) {
    return a
  } else {
    return [a]
  }
}

module.exports = {
  toArray
}
