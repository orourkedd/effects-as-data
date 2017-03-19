const { pick, merge } = require('ramda')

function getGlobal () {
  let g
  if (typeof window !== 'undefined') {
    g = window
  } else {
    g = global
  }
  return g
}

function getGlobalState () {
  const g = getGlobal()
  g.effectsAsDataState = g.effectsAsDataState || {}
  return g.effectsAsDataState
}

function setGlobalState (payload) {
  const g = getGlobal()
  g.effectsAsDataState = merge(g.effectsAsDataState, payload)
}

function getState ({ keys }) {
  const state = getGlobalState()
  return pick(keys, state)
}

function setState ({ payload }) {
  setGlobalState(payload)
}

module.exports = {
  getState,
  setState,
  getGlobalState
}
