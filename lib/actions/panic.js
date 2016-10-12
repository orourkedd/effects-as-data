'use strict';

function panic(error) {
  if (typeof error === 'string') {
    error = new Error(error);
  }
  return {
    type: 'panic',
    error: error
  };
}

module.exports = {
  panic: panic
};
//# sourceMappingURL=panic.js.map