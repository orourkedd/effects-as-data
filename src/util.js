function isGenerator(fn) {
  return fn && fn.constructor && fn.constructor.name === "GeneratorFunction";
}

function toArray(a) {
  return Array.isArray(a) ? a : [a];
}

const isPromise = v => v && v.then;
const toPromise = v => (isPromise(v) ? v : Promise.resolve(v));

const delay =
  typeof setImmediate === undefined ? fn => setTimeout(fn, 0) : setImmediate;

// @see https://gist.github.com/LeverOne/1308368
function uuid(a, b) {
  for (
    b = a = "";
    a++ < 36;
    b +=
      (a * 51) & 52
        ? (a ^ 15 ? 8 ^ (Math.random() * (a ^ 20 ? 16 : 4)) : 4).toString(16)
        : "-"
  );
  return b;
}

module.exports = {
  isGenerator,
  toArray,
  toPromise,
  delay,
  uuid
};
