const { setPayload } = require('./set-payload')
const { mapPipe } = require('./map-pipe')
const { panic } = require('./panic')
const { end } = require('./end')
const { addToContext } = require('./context')
const { call } = require('./call')
const { addToErrors } = require('./errors')
const { interpolate } = require('./interpolate')

module.exports = {
  setPayload,
  mapPipe,
  panic,
  end,
  addToContext,
  addToErrors,
  call,
  interpolate
}
