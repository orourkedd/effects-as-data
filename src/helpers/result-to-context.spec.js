const { addToContext, panic } = require('../actions')
const { resultToContext } = require('./result-to-context')
const assert = require('chai').assert
const { deepEqual: deep } = assert

describe('resultToContext', () => {
  it('should copy to result to context using map', () => {
    let r1 = 'value1'
    let r2 = 'value2'
    let context = {
      r1,
      r2
    }

    let expected = [
      addToContext({v1: r1}),
      addToContext({v2: r2})
    ]

    let actual = resultToContext({
      r1: 'v1',
      r2: 'v2'
    })({context, errors: {}})

    deep(actual, expected)
  })

  it('should panic if error', () => {
    let r1 = 'value1'
    let r2 = 'value2'
    let context = {
      r1
    }

    let errors = {
      r2
    }

    let expected = [
      addToContext({v1: r1}),
      panic(r2)
    ]

    let actual = resultToContext({
      r1: 'v1',
      r2: 'v2'
    })({context, errors})

    deep(actual, expected)
  })
})
