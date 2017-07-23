const { functions, cmds } = require('./effects')
const {
  basic,
  basicMultistep,
  basicParallel,
  basicMultistepParallel,
  basicEmpty,
  eitherTestError,
  eitherTestEmpty,
  asyncTest,
  badHandler
} = functions
const { testFn } = require('../test')

test('testFn should pass (basic)', () => {
  testFn(basic, () => {
    // prettier-ignore
    return [
      ['foo', cmds.echo('foo')],
      ['foo', 'foo']
    ]
  })()
})

test('testFn should pass (basicMultistep)', () => {
  testFn(basicMultistep, () => {
    // prettier-ignore
    return [
      ['foo', cmds.echo('foo1')],
      ['foo1', cmds.echo('foo2')],
      ['foo2', {s1: 'foo1', s2: 'foo2'}]
    ]
  })()
})

test('testFn should pass (basicParallel)', () => {
  const c = [cmds.echo('foo'), cmds.echo('foo')]
  testFn(basicParallel, () => {
    // prettier-ignore
    return [
      ['foo', c],
      [['foo', 'foo'], {s1: 'foo1', s2: 'foo2'}]
    ]
  })()
})

test('testFn should pass (basicMultistepParallel)', () => {
  const c1 = [cmds.echo('foo'), cmds.echo('foo')]
  const c2 = [cmds.echo('foo'), cmds.echo('foo')]
  testFn(basicMultistepParallel, () => {
    // prettier-ignore
    return [
      ['foo', c1],
      [['foo', 'foo'], c2],
      [['foo', 'foo'], {s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4'}]
    ]
  })()
})

test('testFn should pass (basicEmpty)', () => {
  testFn(basicEmpty, () => {
    // prettier-ignore
    return [
      [null, []],
      [[], []]
    ]
  })()
})

test('testFn should pass (eitherTestError)', () => {
  testFn(eitherTestError, () => {
    // prettier-ignore
    return [
      [null, cmds.either(cmds.die('oops'), 'foo')],
      ['foo', 'foo']
    ]
  })()
})

test('testFn should handle errors (badHandler)', () => {
  testFn(badHandler, () => {
    // prettier-ignore
    return [
      [null, cmds.die('oops')],
      [new Error('oops!'), new Error('oops!')]
    ]
  })()
})

test('testFn should pass (eitherTestEmpty)', () => {
  testFn(eitherTestEmpty, () => {
    // prettier-ignore
    return [
      [null, cmds.either(cmds.echo(null), 'foo')],
      ['foo', 'foo']
    ]
  })()
})

test('testFn should pass (asyncTest)', () => {
  testFn(asyncTest, () => {
    // prettier-ignore
    return [
      [null, cmds.async({ type: 'test' })],
      [null, null]
    ]
  })()
})
