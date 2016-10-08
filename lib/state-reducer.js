'use strict';

var _require = require('ramda');

var curry = _require.curry;
var reduce = _require.reduce;
var merge = _require.merge;

var stateReducer = curry(function (state, actions) {
  return reduce(function (p, action) {
    switch (action.type) {
      case 'setPayload':
        return merge(p, {
          payload: action.payload
        });

      case 'addToContext':
        return merge(p, {
          context: merge(p.context, action.value)
        });

      case 'addToErrors':
        return merge(p, {
          errors: merge(p.errors, action.value)
        });

      default:
        return p;
    }
  }, state, actions);
});

module.exports = {
  stateReducer: stateReducer
};
//# sourceMappingURL=state-reducer.js.map