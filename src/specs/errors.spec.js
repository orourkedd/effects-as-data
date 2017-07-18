const { call } = require('../call')
const { handlers, functions } = require('./effects')
const { betterError } = require('../util')
const { omit } = require('ramda')

test('call should throw an error for an undefined function', async () => {
  const message = 'A function is required. Perhaps your function is undefined?'
  const e = betterError(message)
  const omitStack = omit('stack')
  try {
    await call({}, handlers, undefined)
  } catch (actual) {
    const ne = new Error(message)
    const expected = betterError(ne)
    expect(omitStack(actual)).toEqual(omitStack(expected))
    return
  }
  fail('Did not reject')
})
