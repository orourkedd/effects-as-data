const { run, isSuccess, success, failure } = require('../index')
const { deepEqual } = require('assert')

function getName() {
  return 'Frankie'
}

function fail() {
  return failure('oops')
}

const handlers = {
  getName,
  fail
}

const actionResultInterceptor = result => {
  return isSuccess(result) ? result.payload : result
}

const config = {
  actionResultInterceptor
}

describe('Action result intercepters', () => {
  it('should intercept action results and unwrap successes', () => {
    function* test() {
      return yield { type: 'getName' }
    }

    return run(handlers, test, null, config).then(name => {
      deepEqual(name, 'Frankie')
    })
  })

  it('should intercept action results and do nothing to failures', () => {
    function* test() {
      return yield { type: 'fail' }
    }

    return run(handlers, test, null, config).then(f => {
      deepEqual(f, failure('oops'))
    })
  })

  it('should not apply to function arguments', () => {
    function* test(a) {
      return a
    }

    return run(handlers, test, success(42), config).then(result => {
      deepEqual(result, success(42))
    })
  })
})
