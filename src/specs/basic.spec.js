const { call } = require('../index')
const { handlers, functions } = require('./effects')
const {
  basic,
  basicMultistep,
  basicParallel,
  basicMultistepParallel,
  basicEmpty
} = functions

test('basic', async () => {
  const expected = 'foo'
  const actual = await call({}, handlers, basic, expected)
  expect(actual).toEqual(expected)
})

test('basicMultistep', async () => {
  const actual = await call({}, handlers, basicMultistep, 'foo')
  const expected = { s1: 'foo1', s2: 'foo2' }
  expect(actual).toEqual(expected)
})

test('basicParallel', async () => {
  const actual = await call({}, handlers, basicParallel, 'foo')
  const expected = { s1: 'foo1', s2: 'foo2' }
  expect(actual).toEqual(expected)
})

test('basicMultistepParallel', async () => {
  const actual = await call({}, handlers, basicMultistepParallel, 'foo')
  const expected = { s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' }
  expect(actual).toEqual(expected)
})

test('basicEmpty', async () => {
  const expected = []
  const actual = await call({}, handlers, basicEmpty)
  expect(actual).toEqual(expected)
})
