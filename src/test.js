const { deepEqual } = require('chai').assert
const {
  map,
  prop,
  toArray,
  zip,
  curry,
  normalizeToSuccess
} = require('./util')
const { handleActions } = require('../src/handle-actions')
const { runTest, run } = require('../src/run')

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
  // checkForArrays(expected)

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

const checkForArrays = (expected) => {
  for (let i = 0; i < expected.length; i++) {
    if (i + 1 >= expected.length) return
    let output = expected[i][1]
    let nextInput = expected[i + 1][0]
    console.log('o:', output)
    console.log('i:', nextInput)
    if (Array.isArray(output) !== Array.isArray(nextInput)) {
      throw new Error('If you yield to an array, an array will be returned.')
    }
  }
}

const testIt =(fn, expected) => {
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
