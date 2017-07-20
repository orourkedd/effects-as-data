const { call } = require('../index')
const { handlers, functions } = require('./effects')
const { eitherTestError, eitherTestEmpty } = functions

test('call should use either, handle error, and return default value', async () => {
  const actual = await call({}, handlers, eitherTestError)
  const expected = 'foo'
  expect(actual).toEqual(expected)
})

test('call should use either, handle error, and return default value if return value is falsey', async () => {
  const actual = await call({}, handlers, eitherTestEmpty)
  const expected = 'foo'
  expect(actual).toEqual(expected)
})
