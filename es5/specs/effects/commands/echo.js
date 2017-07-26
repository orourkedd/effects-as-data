'use strict';

function echo(value) {
  return {
    type: 'echo',
    value: value
  };
}

function echoPromise(value) {
  return {
    type: 'echoPromise',
    value: value
  };
}

module.exports = {
  echo: echo,
  echoPromise: echoPromise
};
//# sourceMappingURL=echo.js.map