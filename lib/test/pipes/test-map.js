'use strict';

var _require = require('../../actions');

var mapPipe = _require.mapPipe;
var setPayload = _require.setPayload;

var _require2 = require('ramda');

var merge = _require2.merge;

function getUsers1() {
  var users = [{ id: 1 }, { id: 2 }, { id: 3 }];
  return mapPipe('usersWithNames', addNames, users);
}

function getUsers2(_ref) {
  var context = _ref.context;

  return setPayload(context.usersWithNames);
}

function addNames1(_ref2) {
  var payload = _ref2.payload;

  var user = merge(payload, {
    name: 'Us'
  });
  return setPayload(user);
}

function addNames2(_ref3) {
  var payload = _ref3.payload;

  var user = merge(payload, {
    name: payload.name + 'er'
  });
  return setPayload(user);
}

function addNames3(_ref4) {
  var payload = _ref4.payload;

  var user = merge(payload, {
    name: payload.name + ' ' + payload.id
  });
  return setPayload(user);
}

var addNames = [addNames1, addNames2, addNames3];

module.exports = {
  testMap: [getUsers1, getUsers2],
  addNames: addNames
};
//# sourceMappingURL=test-map.js.map