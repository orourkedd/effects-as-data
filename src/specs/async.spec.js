const { call } = require('../call')
const { functions, handlers } = require('./effects')
const { asyncify } = handlers
const { asyncTest } = functions
const { sleep } = require('./test-util')

test('async', async () => {
  let called = false
  const testHandler = () => {
    called = true
  }
  await call({}, { asyncify, test: testHandler }, asyncTest)
  expect(called).toEqual(false)
  await sleep(50)
  expect(called).toEqual(true)
})
