const assert = require('assert')
const curry = require('lodash/curry')
const chunk = require('lodash/chunk')

const testRunner = (fn, expected, index = 0, previousOutput = null) => {
  checkForExpectedTypeMismatches(expected)

  assert(fn, 'The function you are trying to test is undefined.')

  const step = expected[index]

  if (step === undefined) {
    throw new Error(
      'Your spec does not have as many steps as your function.  Are you missing a return line?'
    )
  }

  const [input, expectedOutput] = step
  let g
  if (fn.next) {
    g = fn
  } else {
    g = fn.apply(null, input)
  }

  let output
  if (isError(input)) {
    try {
      output = g.throw(input)
    } catch (e) {
      output = { value: e, done: true }
    }
  } else {
    output = g.next(input)
  }

  try {
    deepEqual(output.value, expectedOutput)
  } catch (e) {
    e.name = `Error on Step ${index + 1}`
    throw e
  }

  if (!output.done || index + 1 < expected.length) {
    testRunner(g, expected, index + 1, output.value)
  }
}

function isError(e) {
  if (!e) return false
  return e instanceof Error
}

const checkForExpectedTypeMismatches = expected => {
  if (!Array.isArray(expected)) {
    throw new Error(
      `Your spec must return an array of tuples.  It is currently returning a value of type "${typeof expected}".`
    )
  }
  for (let i = 0; i < expected.length; i++) {
    if (i + 1 >= expected.length) return
    let output = expected[i][1]
    let nextInput = expected[i + 1][0]

    if (Array.isArray(output)) {
      assert(
        Array.isArray(nextInput),
        'If an array of actions is yielded, it should return an array of results.'
      )
    }
  }
}

const testFn = (fn, spec) => {
  return function() {
    let expectedLog = spec()
    testRunner(fn, expectedLog)
  }
}

const testFnV2 = (fn, spec) => {
  return function() {
    let expectedLog = spec()
    const flat = expectedLog.reduce((p, step, index, log) => {
      if (index === 0 || index === log.length - 1) {
        p.push(step)
        return p
      }

      p.push(step[0])
      p.push(step[1])
      return p
    }, [])
    const v1Log = chunk(flat, 2)
    testRunner(fn, v1Log)
  }
}

function deepEqual(actual, expected) {
  //  a little bit of jest support
  if (typeof expect !== 'undefined' && expect.extend && expect.anything) {
    expect(actual).toEqual(expected)
  } else {
    assert.deepEqual(actual, expected)
  }
}

// Semantic test builder
const args = (...fnArgs) => {
  const t = [[fnArgs]]
  return { yieldCmd: yieldCmd(t), returns: returns(t) }
}

const yieldCmd = t => v => {
  t[t.length - 1][1] = v
  return {
    yieldReturns: yieldReturns(t)
  }
}

const yieldReturns = t => v => {
  t[t.length] = [v]

  return {
    yieldCmd: yieldCmd(t),
    returns: returns(t)
  }
}

const returns = t => a => {
  t[t.length - 1][1] = a
  return t
}

// Modified tuples
function alt() {}

module.exports = {
  testRunner,
  testFn: curry(testFn, 2),
  testFnV2: curry(testFnV2, 2),
  alt,
  args
}
