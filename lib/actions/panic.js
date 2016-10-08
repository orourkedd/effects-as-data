'use strict';

function panic(error) {
  return {
    type: 'panic',
    error: error
  };
}

module.exports = {
  panic: panic
};
//# sourceMappingURL=panic.js.map