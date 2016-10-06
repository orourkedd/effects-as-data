const { mapPipe, setPayload } = require('../../actions')
const { merge } = require('ramda')

function getUsers1 () {
  let users = [{id: 1}, {id: 2}, {id: 3}]
  return mapPipe('usersWithNames', addNames, users)
}

function getUsers2 ({context}) {
  return setPayload(context.usersWithNames)
}

function addNames1 ({payload}) {
  let user = merge(payload, {
    name: `Us`
  })
  return setPayload(user)
}

function addNames2 ({payload}) {
  let user = merge(payload, {
    name: `${payload.name}er`
  })
  return setPayload(user)
}

function addNames3 ({payload}) {
  let user = merge(payload, {
    name: `${payload.name} ${payload.id}`
  })
  return setPayload(user)
}

const addNames = [addNames1, addNames2, addNames3]

module.exports = {
  testMap: [getUsers1, getUsers2],
  addNames
}
