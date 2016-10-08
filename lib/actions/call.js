'use strict';

function call(contextKey, pipe, state) {
  return {
    type: 'call',
    pipe: pipe,
    contextKey: contextKey,
    state: state
  };
}

module.exports = {
  call: call
};
//# sourceMappingURL=call.js.map