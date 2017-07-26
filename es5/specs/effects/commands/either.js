'use strict';

function either(cmd, defaultValue) {
  return {
    type: 'either',
    cmd: cmd,
    defaultValue: defaultValue
  };
}

module.exports = {
  either: either
};
//# sourceMappingURL=either.js.map