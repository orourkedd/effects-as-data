const {
  unwrapArgs,
  unwrapArray,
  toArray,
  toPromise
} = require('./util')
const { deepEqual } = require('assert')

describe('util.js', () => {
  describe('#unwrapArray', () => {
    it('should return element 0 if the array has a length of 1', () => {
      const input = [1]
      const expected = 1
      const actual = unwrapArray(input)
      deepEqual(actual, expected)
    })

    it('should return value if not an array', () => {
      const input = 1
      const expected = 1
      const actual = unwrapArray(input)
      deepEqual(actual, expected)
    })

    it('should return the array if length is greater than 1', () => {
      const input = [1, 2]
      const expected = [1, 2]
      const actual = unwrapArray(input)
      deepEqual(actual, expected)
    })
  })

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
})
