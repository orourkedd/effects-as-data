'use strict';

function isGenerator(fn) {
  return fn && fn.constructor && fn.constructor.name === 'GeneratorFunction';
}

function toArray(a) {
  return Array.isArray(a) ? a : [a];
}

var isPromise = function isPromise(v) {
  return v && v.then;
};
var toPromise = function toPromise(v) {
  return isPromise(v) ? v : Promise.resolve(v);
};

var errorToJson = function errorToJson(e) {
  var props = Object.getOwnPropertyNames(e).concat('name');
  return props.reduce(function (p, c) {
    p[c] = e[c];
    return p;
  }, {});
};

module.exports = {
  isGenerator: isGenerator,
  toArray: toArray,
  toPromise: toPromise,
  errorToJson: errorToJson
};
//# sourceMappingURL=util.js.map