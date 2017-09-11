const { cmds } = require('./effects')
const { testFn } = require('../test')

function* foo() {
  return yield cmds.echo('foo')
}

test(
  'testFn should fail if the function error is different than the test error',
  testFn(foo, () => {
    // prettier-ignore
    return [
      [ [], cmds.echo('bar') ],
      ['foo', 'foo']
    ]
  })
)
