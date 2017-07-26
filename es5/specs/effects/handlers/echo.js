"use strict";

function echo(_ref) {
  var value = _ref.value;

  return value;
}

function echoPromise(_ref2) {
  var value = _ref2.value;

  return Promise.resolve(value);
}

module.exports = {
  echo: echo,
  echoPromise: echoPromise
};
//# sourceMappingURL=echo.js.map