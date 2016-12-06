const assert = require('assert')
const { deepEqual } = assert
const {
  map,
  prop,
  curry,
  normalizeToSuccess
} = require('./util')
const { runTest } = require('./run')

const testHandlers = async (fn, payload, actionHandlers, expectedOutput) => {
  return runTest(actionHandlers, fn, payload).then(({log}) => {
    const outputPicker = prop(1)
    const actualOutput = map(outputPicker, log)
    deepEqual(actualOutput, expectedOutput)
  })
}

const testFn = (fn, expected, index = 0, previousOutput = null) => {
  checkForExpectedTypeMismatches(expected)

  const [input, expectedOutput] = expected[index] || []
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
  try {
    deepEqual(actualOutput, expectedOutput)
  } catch (e) {
    let errorMessage = [e.message, '\n']

    errorMessage.push(`Error on Step ${index + 1}`)
    errorMessage.push('============================')
    errorMessage.push('\nExpected:')
    errorMessage.push(JSON.stringify(expectedOutput, true, 2))

    errorMessage.push('\nActual:')
    errorMessage.push(JSON.stringify(actualOutput, true, 2))
    errorMessage.push('\n')
    e.message = errorMessage.join('\n')

    throw e
  }
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
      assert(Array.isArray(nextInput), 'If an array of actions is yielded, it should return an array of results.')
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
