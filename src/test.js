const assert = require('chai').assert
const { deepEqual } = assert
const {
  map,
  prop,
  toArray,
  curry,
  normalizeToSuccess
} = require('./util')
const { runTest } = require('../src/run')

const testHandlers = (fn, payload, actionHandlers, expectedActions) => {
  return runTest(actionHandlers, fn, payload)
  .then(({payload: actualPayload, log}) => {
    const actualActions = map(prop('actions'), log)
    const actionLength = Math.max(actualActions.length, expectedActions.length)
    const expectedPayload = expectedActions.pop()
    for (let i = 0; i < actionLength; i++) {
      resultEqual(actualActions[i], expectedActions[i])
    }
    deepEqual(actualPayload, expectedPayload)
  })
}

const resultEqual = (actual, expected) => {
  deepEqual(toArray(actual), toArray(expected))
}

const testFn = (fn, expected, index = 0, previousOutput = null) => {
  checkForExpectedTypeMismatches(expected)

  const [input, expectedOutput] = expected[index]
  let g
  if (fn.next) {
    g = fn
  } else {
    g = fn(input)
  }

  let normalizedInput
  if (Array.isArray(previousOutput)) {
    normalizedInput = input
  } else {
    normalizedInput = normalizeToSuccess(input)
  }
  let { value: actualOutput, done } = g.next(normalizedInput)
  deepEqual(actualOutput, expectedOutput)
  if (!done || index + 1 < expected.length) {
    testFn(g, expected, index + 1, actualOutput)
  }
}

const checkForExpectedTypeMismatches = (expected) => {
  for (let i = 0; i < expected.length; i++) {
    if (i + 1 >= expected.length) return
    let output = expected[i][1]
    let nextInput = expected[i + 1][0]

    if (Array.isArray(output)) {
      assert(Array.isArray(nextInput), 'If an array of actions is yielded, it will return an array of results.')
    }
  }
}

const testIt = (fn, expected) => {
  return function () {
    let expectedLog = expected()
    testFn(fn, expectedLog)
  }
}

module.exports = {
  testHandlers: curry(testHandlers),
  testFn: curry(testFn),
  testIt: curry(testIt)
}
