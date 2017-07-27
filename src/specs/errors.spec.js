const { call } = require('../index')
const { handlers, functions } = require('./effects')
const {
  badHandler,
  throwAtYield,
  throwAtYieldRecovery,
  functionErrorTest
} = functions
const { expectError } = require('./test-util')

test('call should reject for an undefined function', async () => {
  try {
    await call({}, handlers, undefined)
  } catch (actual) {
    const message =
      'A function is required. Ensure that the third argument of call() is a function.'
    return expectError(actual, message)
  }
  fail('Function did not reject.')
})

test('call should catch function errors', async () => {
  try {
    await call({}, handlers, functionErrorTest)
  } catch (actual) {
    const message = 'oops!'
    return expectError(actual, message)
  }
  fail('Function did not reject.')
})

test('call should throw error at the yield', async () => {
  const actual = await call({}, handlers, throwAtYield)
  const expected = 'caught!'
  expect(actual).toEqual(expected)
})

test('call should throw error at the yield and recover', async () => {
  const actual = await call({}, handlers, throwAtYieldRecovery)
  const expected = 'foo'
  expect(actual).toEqual(expected)
})
