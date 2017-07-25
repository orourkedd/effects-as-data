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

test('testFn should pass (basic)', () => {
  testFn(basic, () => {
    // prettier-ignore
    return [
      ['foo', cmds.echo('foo')],
      ['foo', 'foo']
    ]
  })()
})

test('testFn semantic should pass (basic)', () => {
  testFn(basic, () => {
    //  prettier-ignore
    return args('foo')
      .calls(cmds.echo('foo'))
      .returns('foo')
      .end('foo')
  })()
})

test('testFn should curry', () => {
  testFn(basic)(() => {
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

test('testFn semantic should pass (basicMultistep)', () => {
  testFn(basicMultistep, () => {
    return args('foo')
      .calls(cmds.echo('foo1'))
      .returns('foo1')
      .calls(cmds.echo('foo2'))
      .returns('foo2')
      .end({ s1: 'foo1', s2: 'foo2' })
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

test('testFn semantic should pass (basicParallel)', () => {
  const c = [cmds.echo('foo'), cmds.echo('foo')]
  testFn(basicParallel, () => {
    return args('foo')
      .calls(c)
      .returns(['foo', 'foo'])
      .end({ s1: 'foo1', s2: 'foo2' })
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

test('testFn semantic should pass (basicMultistepParallel)', () => {
  const c1 = [cmds.echo('foo'), cmds.echo('foo')]
  const c2 = [cmds.echo('foo'), cmds.echo('foo')]
  testFn(basicMultistepParallel, () => {
    return args('foo')
      .calls(c1)
      .returns(['foo', 'foo'])
      .calls(c2)
      .returns(['foo', 'foo'])
      .end({ s1: 'foo1', s2: 'foo2', s3: 'foo3', s4: 'foo4' })
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

test('testFn semantic should pass (basicEmpty)', () => {
  testFn(basicEmpty, () => {
    return args(null).calls([]).returns([]).end([])
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

test('testFn semantic should pass (eitherTestError)', () => {
  testFn(eitherTestError, () => {
    return args(null)
      .calls(cmds.either(cmds.die('oops'), 'foo'))
      .returns('foo')
      .end('foo')
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

test('testFn semantic should handle errors (badHandler)', () => {
  testFn(badHandler, () => {
    return args(null)
      .calls(cmds.die('oops'))
      .returns(new Error('oops!'))
      .end(new Error('oops!'))
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

test('testFn semantic should pass (eitherTestEmpty)', () => {
  testFn(eitherTestEmpty, () => {
    return args(null)
      .calls(cmds.either(cmds.echo(null), 'foo'))
      .returns('foo')
      .end('foo')
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

test('testFn semantic should pass (asyncTest)', () => {
  testFn(asyncTest, () => {
    return args(null)
      .calls(cmds.async({ type: 'test' }))
      .returns(null)
      .end(null)
  })()
})

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
      .calls(cmds.httpGet('http://example.com/api/v1/users/123'))
      .returns({ foo: 'bar' })
      .end({ foo: 'bar' })
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
