const { setPayload, panic } = require('../actions')
const { resultToPayload } = require('./result-to-payload')
const assert = require('chai').assert
const { deepEqual: deep } = assert

describe('resultToPayload', () => {
  it('should copy to result to payload using map', () => {
    let r1 = 'value1'
    let r2 = 'value2'
    let context = {
      r1,
      r2
    }

    let expected = [
      setPayload({
        v1: r1,
        v2: r2,
        v3: 'value3'
      })
    ]

    let actual = resultToPayload({
      r1: 'v1',
      r2: 'v2'
    })({context, errors: {}, payload: {v3: 'value3'}})

    deep(actual, expected)
  })

  it('should copy to result to payload using array', () => {
    let r1 = 'value1'
    let r2 = 'value2'
    let context = {
      r1,
      r2
    }

    let expected = [
      setPayload({
        r1,
        r2,
        r3: 'value3'
      })
    ]

    let actual = resultToPayload(['r1', 'r2'])({context, errors: {}, payload: {r3: 'value3'}})

    deep(actual, expected)
  })

  it('should copy to result to payload using a string', () => {
    let r1 = 'value1'
    let r2 = 'value2'
    let context = {
      r1,
      r2
    }

    let expected = [
      setPayload({
        r1,
        r3: 'value3'
      })
    ]

    let actual = resultToPayload('r1')({context, errors: {}, payload: {r3: 'value3'}})

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
      panic(r2),
      setPayload({
        r1,
        r3: 'value3'
      })
    ]

    let actual = resultToPayload(['r1', 'r2'])({context, errors, payload: {r3: 'value3'}})

    deep(actual, expected)
  })
})
