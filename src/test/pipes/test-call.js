const { call } = require('../../actions/call')
const { setPayload } = require('../../actions/set-payload')
const { merge } = require('ramda')

function mainPipeA ({payload}) {
  return call('subPipe1', subPipe1, payload)
}

function mainPipeB ({context}) {
  let state = context.subPipe1
  return setPayload(state.payload)
}

function subPipe1A ({payload}) {
  return call('subPipe2', subPipe2, payload)
}

function subPipe1B ({context}) {
  let state = context.subPipe2
  return setPayload(state.payload)
}

function subPipe2A ({payload}) {
  let newPayload = merge(payload, {
    sub: 'pipe'
  })
  return setPayload(newPayload)
}

const testCall = [mainPipeA, mainPipeB]
const subPipe1 = [subPipe1A, subPipe1B]
const subPipe2 = [subPipe2A]

module.exports = {
  testCall,
  subPipe1,
  subPipe2
}
