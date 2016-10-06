const { mapPipe, setPayload } = require('../../actions')
const { merge } = require('ramda')

function getUsers1 () {
  let users = [{id: 1}, {id: 2}, {id: 3}]
  return mapPipe('usersWithNames', addNames, users)
}

function getUsers2 ({context}) {
  return setPayload(context.usersWithNames)
}

function addNames ({payload}) {
  let user = merge(payload, {
    name: `User ${payload.id}`
  })
  return setPayload(user)
}

module.exports = {
  testMap: [getUsers1, getUsers2],
  addNames
}
