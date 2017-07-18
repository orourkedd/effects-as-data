const { call } = require('../call')
const { handlers, functions } = require('./effects')
const { badHandler } = functions
const { expectError } = require('./test-util')

test('call should reject for an undefined function', async () => {
  try {
    await call({}, handlers, undefined)
  } catch (actual) {
    const message =
      'A function is required. Perhaps your function is undefined?'
    return expectError(actual, message)
  }
  fail('Function did not reject.')
})
