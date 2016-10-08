'use strict';

function toArray(a) {
  if (typeof a === 'undefined') {
    return [];
  } else if (Array.isArray(a)) {
    return a;
  } else {
    return [a];
  }
}

function toPromise(v) {
  if (!v || !v.then) {
    return Promise.resolve(v);
  }

  return v;
}

function keyed(key, value) {
  var patch = {};
  patch[key] = value;
  return patch;
}

module.exports = {
  toArray: toArray,
  toPromise: toPromise,
  keyed: keyed
};
//# sourceMappingURL=util.js.map