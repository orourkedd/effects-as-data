'use strict';

var _require = require('../../effects-as-data');

var simplePlugin = _require.simplePlugin;

function test1Plugin(payload) {
  return Promise.resolve('test1-result');
}

function test1(contextKey) {
  return {
    type: 'test1',
    contextKey: contextKey,
    payload: {}
  };
}

module.exports = {
  test1Plugin: simplePlugin(test1Plugin),
  test1: test1
};
//# sourceMappingURL=test1.js.map