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
const { testFn, args } = require('../test')

function* singleLine(id) {
  const s1 = yield cmds.httpGet(`http://example.com/api/v1/users/${id}`)
  return s1
}

function* yieldArray() {
  const s1 = yield [{ type: 'test' }]
  return s1
}

const testSingleLine = testFn(singleLine)
const testYieldArray = testFn(yieldArray)

test(
  'testFn should pass (basic)',
  testFn(basic, () => {
    // prettier-ignore
    return [
      ['foo', cmds.echo('foo')],
      ['foo', 'foo']
    ]
  })
)

test(
  'testFn semantic should pass (basic)',
  testFn(basic, () => {
    //  prettier-ignore
    return args('foo')
      .yieldCmd(cmds.echo('foo'))
      .yieldReturns('foo')
      .returns('foo')
  })
)

test(
  'testFn should curry',
  testFn(basic)(() => {
    // prettier-ignore
    return [
      ['foo', cmds.echo('foo')],
      ['foo', 'foo']
    ]
  })
)

test(
  'testFn should pass (basicMultistep)',
  testFn(basicMultistep, () => {
    // prettier-ignore
    return [
      ['foo', cmds.echo('foo1')],
      ['foo1', cmds.echo('foo2')],
      ['foo2', {s1: 'foo1', s2: 'foo2'}]
    ]
  })
)

test(
  'testFn semantic should pass (basicMultistep)',
  testFn(basicMultistep, () => {
    return args('foo')
      .yieldCmd(cmds.echo('foo1'))
      .yieldReturns('foo1')
      .yieldCmd(cmds.echo('foo2'))
      .yieldReturns('foo2')
      .returns({ s1: 'foo1', s2: 'foo2' })
  })
)

test(
  'testFn should pass (basicParallel)',
  testFn(basicParallel, () => {
    const c = [cmds.echo('foo'), cmds.echo('foo')]
    // prettier-ignore
    return [
      ['foo', c],
      [['foo', 'foo'], {s1: 'foo1', s2: 'foo2'}]
    ]
  })
)

test(
  'testFn semantic should pass (basicParallel)',
  testFn(basicParallel, () => {
    const c = [cmds.echo('foo'), cmds.echo('foo')]
    return args('foo')
      .yieldCmd(c)
      .yieldReturns(['foo', 'foo'])
      .returns({ s1: 'foo1', s2: 'foo2' })
  })
)

test(
  'testFn should pass (basicMultistepParallel)',
  testFn(basicMultistepParallel, () => {
    const c1 = [cmds.echo('foo'), cmds.echo('foo')]
    const c2 = [cmds.echo('foo'), cmds.echo('foo')]
    // prettier-ignore
    return [
      ['foo', c1],
      [['foo', 'foo'], c2],
      [['foo', 'foo'], {s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4'}]
    ]
  })
)

test(
  'testFn semantic should pass (basicMultistepParallel)',
  testFn(basicMultistepParallel, () => {
    const c1 = [cmds.echo('foo'), cmds.echo('foo')]
    const c2 = [cmds.echo('foo'), cmds.echo('foo')]
    return args('foo')
      .yieldCmd(c1)
      .yieldReturns(['foo', 'foo'])
      .yieldCmd(c2)
      .yieldReturns(['foo', 'foo'])
      .returns({ s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' })
  })
)

test(
  'testFn should pass (basicEmpty)',
  testFn(basicEmpty, () => {
    // prettier-ignore
    return [
      [null, []],
      [[], []]
    ]
  })
)

test(
  'testFn semantic should pass (basicEmpty)',
  testFn(basicEmpty, () => {
    return args(null).yieldCmd([]).yieldReturns([]).returns([])
  })
)

test(
  'testFn should pass (eitherTestError)',
  testFn(eitherTestError, () => {
    // prettier-ignore
    return [
      [null, cmds.either(cmds.die('oops'), 'foo')],
      ['foo', 'foo']
    ]
  })
)

test(
  'testFn semantic should pass (eitherTestError)',
  testFn(eitherTestError, () => {
    return args(null)
      .yieldCmd(cmds.either(cmds.die('oops'), 'foo'))
      .yieldReturns('foo')
      .returns('foo')
  })
)

test(
  'testFn should handle errors (badHandler)',
  testFn(badHandler, () => {
    // prettier-ignore
    return [
      [null, cmds.die('oops')],
      [new Error('oops!'), new Error('oops!')]
    ]
  })
)

test(
  'testFn semantic should handle errors (badHandler)',
  testFn(badHandler, () => {
    return args(null)
      .yieldCmd(cmds.die('oops'))
      .yieldReturns(new Error('oops!'))
      .returns(new Error('oops!'))
  })
)

test(
  'testFn should pass (eitherTestEmpty)',
  testFn(eitherTestEmpty, () => {
    // prettier-ignore
    return [
      [null, cmds.either(cmds.echo(null), 'foo')],
      ['foo', 'foo']
    ]
  })
)

test(
  'testFn semantic should pass (eitherTestEmpty)',
  testFn(eitherTestEmpty, () => {
    return args(null)
      .yieldCmd(cmds.either(cmds.echo(null), 'foo'))
      .yieldReturns('foo')
      .returns('foo')
  })
)

test(
  'testFn should pass (asyncTest)',
  testFn(asyncTest, () => {
    // prettier-ignore
    return [
      [null, cmds.async({ type: 'test' })],
      [null, null]
    ]
  })
)

test(
  'testFn semantic should pass (asyncTest)',
  testFn(asyncTest, () => {
    return args(null)
      .yieldCmd(cmds.async({ type: 'test' }))
      .yieldReturns(null)
      .returns(null)
  })
)

test(
  'single line should not fail',
  testSingleLine(() => {
    //  prettier-ignore
    return [
      ['123', cmds.httpGet('http://example.com/api/v1/users/123')],
      [{foo: 'bar'}, {foo: 'bar'}]
    ]
  })
)

test(
  'testFn semantic single line should not fail',
  testSingleLine(() => {
    return args('123')
      .yieldCmd(cmds.httpGet('http://example.com/api/v1/users/123'))
      .yieldReturns({ foo: 'bar' })
      .returns({ foo: 'bar' })
  })
)

test('testFn should give proper error message if yielding array but no results', () => {
  try {
    testYieldArray(() => {
      //  prettier-ignore
      return [
        [undefined, [{type: 'test'}]]
      ]
    })()
  } catch (e) {
    expect(e.message).toEqual(
      'Your spec does not have as many steps as your function.  Are you missing a return line?'
    )
  }
})

test('testFn should give proper error message if spec is returning undefined', () => {
  try {
    testYieldArray(() => {})()
  } catch (e) {
    expect(e.message).toEqual(
      'Your spec must return an array of tuples.  It is currently returning a value of type "undefined".'
    )
  }
})

test('testFn should give proper error message if spec is returning an object', () => {
  try {
    testYieldArray(() => {
      return {}
    })()
  } catch (e) {
    expect(e.message).toEqual(
      'Your spec must return an array of tuples.  It is currently returning a value of type "object".'
    )
  }
})

test('testFn should give proper error message if spec is returning an string', () => {
  try {
    testYieldArray(() => {
      return 'what?'
    })()
  } catch (e) {
    expect(e.message).toEqual(
      'Your spec must return an array of tuples.  It is currently returning a value of type "string".'
    )
  }
})
