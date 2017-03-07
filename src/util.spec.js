const {
  unwrapArgs,
  toArray,
  toPromise,
  success,
  failure,
  isSuccess,
  getSuccesses,
  isFailure,
  getFailures,
  normalizeToSuccess,
  normalizeListToSuccess,
  normalizeToFailure,
  isProtocol,
  map,
  clean,
  errorToObject
} = require('./util')
const { deepEqual } = require('assert')

describe('util.js', () => {
  describe('#unwrapArgs', () => {
    it('should return first element in array if array', () => {
      const input = [1]
      const expected = 1
      const actual = unwrapArgs(input)
      deepEqual(actual, expected)
    })

    it('should value if value is not an array', () => {
      const input = 1
      const expected = 1
      const actual = unwrapArgs(input)
      deepEqual(actual, expected)
    })
  })

  describe('#toArray', () => {
    it('should normalize value to an array', () => {
      const input = 1
      const expected = [1]
      const actual = toArray(input)
      deepEqual(actual, expected)
    })

    it('should return if value is an array', () => {
      const input = [1]
      const expected = [1]
      const actual = toArray(input)
      deepEqual(actual, expected)
    })
  })

  describe('#toPromise', () => {
    it('should normalize value to promise', () => {
      const input = 1
      const expected = 1
      const p = toPromise(input)
      return p.then((actual) => {
        deepEqual(actual, expected)
      })
    })

    it('should return promise if value is promise', () => {
      const input = Promise.resolve(1)
      const expected = 1
      const p = toPromise(input)
      return p.then((actual) => {
        deepEqual(actual, expected)
      })
    })
  })

  describe('#success', () => {
    it('should return a success object', () => {
      const expected = {
        success: true,
        payload: 1
      }
      const actual = success(1)
      deepEqual(actual, expected)
    })

    it('should use a default payload of null', () => {
      const actual = success()
      deepEqual(actual.payload === null, true)
    })
  })

  describe('#failure', () => {
    it('should put a string onto an error-like object', () => {
      const error = 'nope'
      const expected = {
        success: false,
        error: {
          message: error
        }
      }
      const actual = failure(error)
      deepEqual(actual, expected)
    })

    it('should return a failure object', () => {
      const error = new Error('nope')
      error.actual = 'test'
      error.expected = 'test1'
      const actual = failure(error)
      const expected = {
        success: false,
        error: {
          message: 'nope',
          name: 'Error',
          actual: 'test',
          expected: 'test1',
          stack: error.stack
        }
      }
      deepEqual(actual, expected)
    })
  })

  describe('#errorToObject', () => {
    it('should convert an error to a serializable object', () => {
      const error = new Error('nope')
      error.actual = 'test'
      error.expected = 'test1'
      const actual = errorToObject(error)
      const expected = {
        message: 'nope',
        name: 'Error',
        actual: 'test',
        expected: 'test1',
        stack: error.stack
      }
      deepEqual(actual, expected)
    })
  })

  describe('#isSuccess', () => {
    it('should return true if is success object', () => {
      const s = {
        success: true,
        payload: 'foo'
      }
      const actual = isSuccess(s)
      const expected = true
      deepEqual(actual, expected)
    })

    it('should return false if is not a success object', () => {
      const s = {
        success: false,
        error: new Error('nope')
      }
      const actual = isSuccess(s)
      const expected = false
      deepEqual(actual, expected)
    })
  })

  describe('#getFailures', () => {
    it('should return all failures', () => {
      const list = [success(1), failure(1), success(2), failure(2)]
      const actual = getSuccesses(list)
      const expected = [success(1), success(2)]
      deepEqual(actual, expected)
    })
  })

  describe('#isFailure', () => {
    it('should return true if is failure object', () => {
      const s = {
        success: false,
        error: new Error('nope')
      }
      const actual = isFailure(s)
      const expected = true
      deepEqual(actual, expected)
    })

    it('should return false if is not a failure object', () => {
      const s = {
        success: true,
        payload: 'foo'
      }
      const actual = isFailure(s)
      const expected = false
      deepEqual(actual, expected)
    })
  })

  describe('#clean', () => {
    it('should clean a success', () => {
      const a = {
        success: true,
        payload: 'abc',
        meta: {
          foo: 'bar'
        }
      }
      const actual = clean(a)
      const expected = {
        success: true,
        payload: 'abc'
      }
      deepEqual(actual, expected)
    })

    it('should clean a failure', () => {
      const a = {
        success: true,
        error: {
          message: 'oops!'
        },
        meta: {
          foo: 'bar'
        }
      }
      const actual = clean(a)
      const expected = {
        success: true,
        error: {
          message: 'oops!'
        }
      }
      deepEqual(actual, expected)
    })
  })

  describe('#getFailures', () => {
    it('should return all failures', () => {
      const list = [failure(1), failure(2), success(), failure(2)]
      const actual = getFailures(list)
      const expected = [failure(1), failure(2), failure(2)]
      deepEqual(actual, expected)
    })
  })

  describe('#normalizeToSuccess', () => {
    it('should wrap value in success object', () => {
      const value = 'foo'
      const actual = normalizeToSuccess(value)
      const expected = success(value)
      deepEqual(actual, expected)
    })

    it('should return value if it is a protocol object', () => {
      const value = 'foo'
      const actual = normalizeToSuccess(success(value))
      const expected = success(value)
      deepEqual(actual, expected)
    })
  })

  describe('#normalizeToFailure', () => {
    it('should wrap value in failure object', () => {
      const value = 'foo'
      const actual = normalizeToFailure(value)
      const expected = failure(value)
      deepEqual(actual, expected)
    })

    it('should return value if it is a protocol object', () => {
      const value = 'foo'
      const actual = normalizeToFailure(failure(value))
      const expected = failure(value)
      deepEqual(actual, expected)
    })
  })

  describe('#normalizeListToSuccess', () => {
    it('should normalize list to success objects', () => {
      const list = [1, 2, 3]
      const expected = map(success, list)
      const actual = normalizeListToSuccess(list)
      deepEqual(actual, expected)
    })

    it('should not double wrap objects', () => {
      const list = [1, success(2), failure(3)]
      const expected = [success(1), success(2), failure(3)]
      const actual = normalizeListToSuccess(list)
      deepEqual(actual, expected)
    })
  })

  describe('#isProtocol', () => {
    it('should return true if object is a protocol object', () => {
      const s1 = {
        success: true,
        payload: 'foo'
      }
      deepEqual(isProtocol(s1), true)

      const s2 = {
        success: true,
        payload: undefined
      }
      deepEqual(isProtocol(s2), true)

      const s3 = {
        success: true,
        payload: undefined,
        random: true
      }
      deepEqual(isProtocol(s3), true)

      const s4 = {
        success: false,
        error: new Error('what?')
      }
      deepEqual(isProtocol(s4), true)
    })

    it('should return false if object is a protocol object', () => {
      const s1 = 'foo'
      deepEqual(isProtocol(s1), false)

      const s2 = {success: true}
      deepEqual(isProtocol(s2), false)

      deepEqual(isProtocol(undefined), false)
    })
  })
})
