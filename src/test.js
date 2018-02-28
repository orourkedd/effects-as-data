const assert = require("assert");
const curry = require("lodash/curry");
const chunk = require("lodash/chunk");
const { deepEqual, isError } = require("./specs/test-util");

const testRunner = (fn, expected, index = 0, previousOutput = null) => {
  checkForExpectedTypeMismatches(expected);

  assert(fn, "The function you are trying to test is undefined.");

  const step = expected[index];

  if (step === undefined) {
    throw new Error(
      "Your spec does not have as many steps as your function.  Are you missing a return line?"
    );
  }

  const [input, expectedOutput] = step;

  if (index === 0 && !Array.isArray(input)) {
    throw new Error(
      "The first argument of the first tuple must be an array representing the arguments of the function."
    );
  }
  let g;
  if (fn.next) {
    g = fn;
  } else {
    g = fn.apply(null, input);
  }

  let output;
  if (isError(input)) {
    try {
      output = g.throw(input);
    } catch (e) {
      output = { value: e, done: true };
    }
  } else {
    try {
      output = g.next(input);
    } catch (e) {
      output = { value: e, done: true };
    }
  }

  const endOnError = isError(output.value);

  try {
    deepEqual(output.value, expectedOutput);
    if (endOnError) return;
  } catch (e) {
    const stepError = `Error on Step ${index + 1}`;
    e.stack = `${stepError}\n\n${e.stack}`;
    throw e;
  }

  if (!output.done || index + 1 < expected.length) {
    testRunner(g, expected, index + 1, output.value);
  }
};

const checkForExpectedTypeMismatches = expected => {
  if (!Array.isArray(expected)) {
    throw new Error(
      `Your spec must return an array of tuples.  It is currently returning a value of type "${typeof expected}".`
    );
  }
  for (let i = 0; i < expected.length; i++) {
    if (i + 1 >= expected.length) return;
    let output = expected[i][1];
    let nextInput = expected[i + 1][0];

    if (Array.isArray(output)) {
      assert(
        Array.isArray(nextInput),
        "If an array of actions is yielded, it should return an array of results."
      );
    }
  }
};

const testFn = (fn, spec) => {
  return function() {
    let expectedLog = spec();
    testRunner(fn, expectedLog);
  };
};

const testFnV2 = (fn, spec) => {
  return function() {
    let expectedLog = spec();
    const flat = expectedLog.reduce((p, step, index, log) => {
      if (index === 0 || index === log.length - 1) {
        p.push(step);
        return p;
      }

      p.push(step[0]);
      p.push(step[1]);
      return p;
    }, []);
    const v1Log = chunk(flat, 2);
    testRunner(fn, v1Log);
  };
};

// Semantic test builder
const args = (...fnArgs) => {
  const t = [[fnArgs]];
  return {
    yieldCmd: yieldCmd(t),
    throws: throwAfterCmdReturns(t),
    returns: returns(t)
  };
};

const yieldCmd = t => v => {
  t[t.length - 1][1] = v;
  return {
    yieldReturns: yieldReturns(t),
    yieldThrows: yieldReturns(t),
    throws: yieldReturnThrows(t),
    returns: returnCmdResult(t)
  };
};

const yieldReturns = t => v => {
  t[t.length] = [v];

  return {
    yieldCmd: yieldCmd(t),
    throws: throwAfterCmdReturns(t),
    returns: returns(t)
  };
};

const returnCmdResult = t => v => {
  t[t.length] = [v, v];
  return t;
};

const yieldReturnThrows = t => v => {
  t[t.length] = [v, v];
  return t;
};

const throwAfterCmdReturns = t => v => {
  t[t.length - 1][1] = v;
  return t;
};

const returns = t => a => {
  t[t.length - 1][1] = a;
  return t;
};

// Modified tuples
function alt() {}

module.exports = {
  testRunner,
  testFn: curry(testFn, 2),
  testFnV2: curry(testFnV2, 2),
  alt,
  args
};
