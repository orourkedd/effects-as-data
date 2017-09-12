# Effects-as-data

Effects-as-data is a micro abstraction layer for Javascript that makes writing, [testing](https://github.com/orourkedd/effects-as-data#second-test-your-business-logic), and [monitoring](https://github.com/orourkedd/effects-as-data#fifth-optionally-setting-up-monitoring--telemetry) side-effects easy.

* Using effects-as-data can dramatically reduce the time it takes to deliver tested code.
* Effects-as-data outputs detailed telemetry, during runtime, allowing you to see every side-effect (HTTP, Disk IO, etc), its latency, and its result giving you insight into your code while it runs in development and production.
* Everything is accessed and tested the same way when using effects-as-data: network request, disk IO, environmental variables, the console, random numbers, etc.
* Effects-as-data is ~1kb minified+gzipped.
* Effects-as-data has *almost* no performance overhead (see `npm run perf`).
* Anywhere you can use promises, you can use effects-as-data.

## Table of Contents
* [Example Projects](#example-projects)
* [Pure Functions, Generators, and Effects-as-data](#pure-functions-generators-and-effects-as-data)
* [Usage in Node and the Browser](#usage-in-node-and-the-browser-es6-and-es5)
* [Getting Started From Scratch](#getting-started-from-scratch)
* [Getting Starting Using Existing Commands and Handlers](#getting-starting-using-existing-commands-and-handlers)
* [Error handling](#error-handling)
* [Parallelization of Commands](#parallelization-of-commands)
* [Telemetry](#telemetry)
* [Testing](#testing)
* [Declarative Application Architecture](#declarative-application-architecture)

## Example Projects

There are several working examples in `effects-as-data-examples`: [Open](https://github.com/orourkedd/effects-as-data-examples)

## Pure Functions, Generators, and Effects-as-data

[Pure functions](https://en.wikipedia.org/wiki/Pure_function) are almost magical compared to "normal" functions.  In fact, impure functions are not really functions (they are more like scripts).  Pure functions are easy to test, are composable, and are not as concerned with dependencies.  All around, pure functions are easier to use.

In Javascript, there is no built-in way to write a pure function that can also perform a <a href="https://en.wikipedia.org/wiki/Side_effect_(computer_science)">side effect</a> (i.e. write to a database, http request, etc).  Because of this we end up writing difficult to test spaghetti code "functions" and resort to brittle testing techniques like mocking and dependency injection.

In comes effects-as-data.  Effects-as-data is a runtime that allows you to write pure functions that merely declare side effects (commands).  Effects-as-data uses [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators).

Why generators? A generator is like a "function with multiple returns".  The power of a generator is that it can hold a lexical scope between these returns and normal control flow operators can be used.  This gives us the power to write very complex side effect production operations as a pure function.

### Think in terms of inputs and outputs only

Effects-as-data does not think in terms of functions `yield`-ing, `return`-ing, `throw`-ing, etc.  In effects-as-data, these are all considered `inputs` and `outputs`. The function arguments and the return value from a `yield` are considered inputs. `yield`-ing out a command, `return`-ing from the function, and `throw`-ing an error are considered outputs.  By using this mental model of inputs and outputs, a Javascript generator can receive arguments, `yield` in and out, `throw` and `return` but can be reasoned about as pure function (i.e. it has a deterministic domain and range).  The litmus test I use for determining purity is to ask the question: can I close over this construct with a pure function?

Consider this diagram which shows the mental model for decomposing a generator to pure functions.  Note, this diagram merely represents a way to think of generators as a series of pure functions.  This model is very effective, but remember "all models are wrong [though] some are useful."  When you are testing this generator function, in your mind you should be really testing `a()` and `b()` in the diagram below.  For more info on testing, see [Testing](#testing).

![Think of Generators as pure functions](https://s3-us-west-2.amazonaws.com/effects-as-data/pure-generator.png)

## Usage in Node and the Browser (ES6 and ES5)

When using in Node: `require('effects-as-data')`  
When using in the browser (or in an old version of node): `require('effects-as-data/es5')`

## Getting Started From Scratch

### First, create a command creator.
This function creates a plain JSON `command` object that effects-as-data will pass to a handler function which will perform the actual HTTP request.  The `type` field on the command matches the name of the handler to which it will be passed (see step 4).  *Note* we have not yet actually implemented the function that will actual do the HTTP GET request, we have just defined a `command`.  The command is placed on the `cmds` object for convenience.  This command represents the `data` in `effects-as-data`. [See Working Code](https://github.com/orourkedd/effects-as-data-examples/blob/master/basic/cmds.js)
```js
// cmds.js

function httpGet(url) {
  return {
    type: "httpGet",
    url
  };
}

module.exports = {
  httpGet
};
```

### Second, test your business logic.
Write a test for `getPeople` function that you are about to create.  These tests can be used stand-alone or in any test runner like Jest, Mocha, etc.  There are a few ways to test `effects-as-data` functions demonstrated below. [See Working Code](https://github.com/orourkedd/effects-as-data-examples/blob/master/basic/functions.spec.js)

Semantic test example:
```js
// functions.spec.js

const { testFn, args } = require("effects-as-data/test");
const cmds = require("./cmds");
const { getPeople } = require("./functions");

const testGetPeople = testFn(getPeople);

test(
  "getPeople() should return list of names",
  testGetPeople(() => {
    const apiResults = { results: [{ name: "Luke Skywalker" }] };
    return args()
      .yieldCmd(cmds.httpGet('https://swapi.co/api/people')).yieldReturns(apiResults)
      .returns(['Luke Skywalker'])
  })
);

```

### Third, write your business logic.
Effects-as-data uses a generator function's ability to give up execution flow and to pass a value to an outside process using the `yield` keyword.  You create `command` objects in your business logic and `yield` them to `effects-as-data`.  It is important to understand that when using effects-as-data that your business logic never actually `httpGet`'s anything.  It ONLY creates plain JSON objects and `yield`'s them out (`cmds.httpGet()` simply returns the JSON object from step 1).  This is one of the main reasons `effects-as-data` functions are easy to test. [See Working Code](https://github.com/orourkedd/effects-as-data-examples/blob/master/basic/functions.js)
```js
// functions.js

const cmds = require("./cmds");

function* getPeople() {
  const { results } = yield cmds.httpGet("https://swapi.co/api/people");
  const names = results.map(p => p.name);
  return names;
}

module.exports = {
  getPeople
};
```

### Fourth, create a command handler.
After the `command` object is `yield`ed, effects-as-data will pass it to a handler function that will perform the side-effect producing operation (in this case, an HTTP GET request).  This is the function mentioned in step 1 that actually performs the HTTP GET request.  Notice that the business logic does not call this function directly; the business logic in step 1 simply `yield`s the `httpGet` `command` out, and `effects-as-data` takes care of getting it to the handler.  The handler does the `effect` in `effects-as-data`. [See Working Code](https://github.com/orourkedd/effects-as-data-examples/blob/master/basic/handlers.js)
```js
// handlers.js

function httpGet(cmd) {
  return fetch(cmd.url).then(r => r.json());
}

module.exports = {
  httpGet
};

```

### Fifth, optionally setting up monitoring / telemetry.
The effects-as-data config accepts an `onCommandComplete` callback which will be called every time a `command` completes, giving detailed information about the operation.  This data can be logged to the console or sent to a logging service.  *Note*, this step is optional.
```js
// Normally this will be in index.js (see below)

const config = {
  // Before a function is called
  onCall: telemetry => {
    console.log("Telemetry (from onCall):", telemetry);
  },
  // After a function completes
  onCallComplete: telemetry => {
    console.log("Telemetry (from onCallComplete):", telemetry);
  },
  // Before a command is processed
  onCommand: telemetry => {
    console.log("Telemetry (from onCommand):", telemetry);
  },
  // After a command is processed
  onCommandComplete: telemetry => {
    console.log("Telemetry (from onCommandComplete):", telemetry);
  }
}
```

### Sixth, wire everything up.
This will turn your effects-as-data functions into normal, promise-returning functions.  In this case, `functions` will be an object with one key, `getPeople`, which will be a promise-returning function. [See Working Code](https://github.com/orourkedd/effects-as-data-examples/blob/master/basic/index.js)
```js
// index.js

const { buildFunctions } = require("effects-as-data");
const handlers = require("./handlers");
const functions = require("./functions");

const config = {
  onCommandComplete: telemetry => {
    console.log("Telemetry (from onCommandComplete):", telemetry);
  }
}

const fns = buildFunctions(config, handlers, functions);

fns
  .getPeople()
  .then(names => {
    console.log("\n");
    console.log("Function Results:");
    console.log(names.join(", "));
  })
  .catch(console.error);
```

### Full Example

See full example in the `effects-as-data-examples` repository: [https://github.com/orourkedd/effects-as-data-examples/blob/master/basic](https://github.com/orourkedd/effects-as-data-examples/blob/master/basic).

## Getting Starting Using Existing Commands and Handlers
This example demonstrates using the `effects-as-data-universal` module which contains commands/handler that can be used anywhere Javascript runs.

```js
const { call, buildFunctions } = require('effects-as-data')
const { testFn, args } = require('effects-as-data/test')
const { cmds, handlers } = require('effects-as-data-universal')

function* getPeople() {
  const { payload } = yield cmds.httpGet('https://swapi.co/api/people')
  const names = payload.results.map(p => p.name)
  return names
}

// Semantic test style
testFn(getPeople, () => {
  const apiResults = { payload: { results: [{ name: 'Luke Skywalker' }] } }
  return args()
    .yieldCmd(cmds.httpGet('https://swapi.co/api/people')).yieldReturns(apiResults)
    .returns(['Luke Skywalker'])
})()

const config = {
  onCommandComplete: telemetry => {
    console.log('Telemetry (from onCommandComplete):', telemetry)
  }
}

const functions = buildFunctions(config, handlers, { getPeople })

functions
  .getPeople()
  .then(names => {
    console.log('\n')
    console.log('Function Results:')
    console.log(names.join(', '))
  })
  .catch(console.error)
```

## Error handling

Below are various examples of error handling with effects-as-data.  It is important to note that effects-as-data will catch any error thrown by your effects-as-data function or thrown by handler and will:

  1. Pass the error to the `onCommandComplete` or `onCallComplete` lifecycle callbacks.  This means you don't have to do any logging in your business logic.  
  1. Reject the promise created by effects-as-data around your running function and pass the error out.
  1. You don't have to write a test to verify that an error is handled ([unless you are doing something specific in a `catch` block](#using-trycatch))

By default errors should act just like they do in `async/await`.  Things get fun, however, when you use command modifiers like [either](#using-cmdseither) or [retry](#using-cmdsretry).  Using command modifiers can add sophisticated error handling to your code without adding complexity.  Pro tip: Because command modifiers are not really a thing (I just call them that because they run other commands), they are all composable.

### Using `try/catch`

```js
// get-people.js

const { cmds } = require('effects-as-data-universal')

function* getPeople() {
  try {
    const results = yield cmds.httpGet('https://swapi.co/api/people')
    return results.map(p => p.name)
  } catch (e) {
    const defaultResults = { results: [] }
    return defaultResults
  }
}

module.exports = getPeople
```

Tests for the `getPeople` function.  These tests are using Jest:
```js
// get-people.spec.js

const { cmds } = require('effects-as-data-universal')
const { testFn, args } = require('effects-as-data/test')
const getPeople = require('./get-people')

const testGetPeople = testFn(getPeople)

test(
  "getPeople should catch an httpGet error and return a default value",
  testGetPeople(() => {
    return args()
      .yieldCmd(cmds.httpGet('https://swapi.co/api/people')).yieldThrows(new Error('oops'))
      .returns({ results: [] })
  })
)

test(
  'getPeople should return an empty list if httpGet errors out',
  testGetPeople(() => {
    const apiResults = { results: [{ name: 'Luke Skywalker' }] }
    const httpGet = cmds.httpGet('https://swapi.co/api/people')
    const defaultResults = { results: [] }
    return args()
      .yieldCmd(cmds.either(httpGet, defaultResults)).yieldReturns(defaultResults)
      .returns([])
  })
)
```

### Using `cmds.either()`

This example demonstrates handling errors using the `either` command found in `effects-as-data-universal`.

The `either` handler will process the `httpGet` command, and if the command is successful, will return the response.  If the `httpGet` command fails or returns a falsey value, the `either` handler will return `defaultResults`.  Because the `either` handler will never throw an exception and will either return a successful result or `defaultResults`, there is no need for an `if` statement to ensure success before the `map`.  Using this pattern will reduce the number of code paths and simplify code.

See Working Example: [https://github.com/orourkedd/effects-as-data-examples/tree/master/misc-examples).

```js
// get-people.js

const { cmds } = require('effects-as-data-universal')

function* getPeople() {
  const httpGet = cmds.httpGet('https://swapi.co/api/people')
  const defaultResults = { results: [] }
  const { results } = yield cmds.either(httpGet, defaultResults)
  return results.map(p => p.name)
}

module.exports = getPeople
```

Tests for the `getPeople` function.  These tests are using Jest:
```js
// get-people.spec.js

const { cmds } = require('effects-as-data-universal')
const { testFn, args } = require('effects-as-data/test')
const getPeople = require('./get-people')

const testGetPeople = testFn(getPeople)

test(
  "getPeople should return a list of people's names",
  testGetPeople(() => {
    const apiResults = { results: [{ name: 'Luke Skywalker' }] }
    const httpGet = cmds.httpGet('https://swapi.co/api/people')
    const defaultResults = { results: [] }
    return args()
      .yieldCmd(cmds.either(httpGet, defaultResults)).yieldReturns(apiResults)
      .returns(['Luke Skywalker'])
  })
)

test(
  'getPeople should return an empty list if httpGet errors out',
  testGetPeople(() => {
    const apiResults = { results: [{ name: 'Luke Skywalker' }] }
    const httpGet = cmds.httpGet('https://swapi.co/api/people')
    const defaultResults = { results: [] }
    return args()
      .yieldCmd(cmds.either(httpGet, defaultResults)).yieldReturns(defaultResults)
      .returns([])
  })
)
```

### Using `cmds.retry()`

This example demonstrates handling errors using the `retry` command found in `effects-as-data-universal`.

The `retry` handler will process the `httpGet` command, and if the command is successful, will return the response.  If the `httpGet` command fails, the `retry` handler will continue to retry the command `durations.length` number of times and at the times specified by the `durations` array.  If a default value is supplied, it will return this value when all retries fail, otherwise it will throw the error from the last failed command.

```js
// get-people.js

const { cmds } = require('effects-as-data-universal')

function* getPeople() {
  const httpGet = cmds.httpGet('https://swapi.co/api/people')
  const defaultResults = { results: [] }
  // retry 3 times but wait 100ms, 500ms, and 1000ms, respectively.
  const durations = [100, 500, 1000]
  const { results } = yield cmds.retry(httpGet, durations, defaultResults)
  return results.map(p => p.name)
}

module.exports = getPeople
```

Tests for the `getPeople` function.  These tests are using Jest:
```js
// get-people.spec.js

const { cmds } = require('effects-as-data-universal')
const { testFn, args } = require('effects-as-data/test')
const getPeople = require('./get-people')

const testGetPeople = testFn(getPeople)

test(
  "getPeople should return a list of people's names",
  testGetPeople(() => {
    const apiResults = { results: [{ name: 'Luke Skywalker' }] }
    const httpGet = cmds.httpGet('https://swapi.co/api/people')
    const defaultResults = { results: [] }
    return args()
      .yieldCmd(cmds.retry(httpGet, [100, 500, 1000], defaultResults)).yieldReturns(apiResults)
      .returns(['Luke Skywalker'])
  })
)

test(
  'getPeople should return an empty list if all retried fail',
  testGetPeople(() => {
    const apiResults = { results: [{ name: 'Luke Skywalker' }] }
    const httpGet = cmds.httpGet('https://swapi.co/api/people')
    const defaultResults = { results: [] }
    return args()
      .yieldCmd(cmds.retry(httpGet, [100, 500, 1000], defaultResults)).yieldReturns(defaultResults)
      .returns([])
  })
)
```

## Parallelization of commands

Parallelization of commands in effects-as-data is easy.  Simply yield an array of commands, and an array of results will be returned in the same order.

See Working Example: [https://github.com/orourkedd/effects-as-data-examples/tree/master/misc-examples).

```js
const { cmds } = require('effects-as-data-universal')

function* getPeople(people) {
  const getCmds = people.map(id => cmds.httpGet(`https://swapi.co/api/people/${id}`))
  const results = yield getCmds
  return results.map(p => p.name)
}

module.exports = getPeople
```

Tests for the `getPeople` function.  These tests are using Jest:
```js
const { cmds } = require('effects-as-data-universal')
const { testFn, args } = require('effects-as-data/test')
const getPeople = require('./get-people')

const testGetPeople = testFn(getPeople)

test(
  "getPeople should return a list of people's names",
  testGetPeople(() => {
    const apiResult1 = { name: 'Luke Skywalker' }
    const apiResult2 = { name: 'C-3PO' }
    const httpGet1 = cmds.httpGet('https://swapi.co/api/people/1')
    const httpGet2 = cmds.httpGet('https://swapi.co/api/people/2')
    return args([1, 2])
      .yieldCmd([httpGet1, httpGet2]).yieldReturns([apiResult1, apiResult2])
      .returns(['Luke Skywalker', 'C-3PO'])
  })
)
```

## Telemetry

Detailed telemetry about your effects-as-data code can be gathered by adding any of these lifecycle callbacks to your effects-as-data config.  This data can be pushed to your logging system, dropped onto Kafka, etc, and used for monitoring and alerting.  This telemetry covers all inputs and outputs of the function.

```js
const config = {
  // Before a function is called
  onCall: telemetry => {
    console.log("Telemetry (from onCall):", telemetry);
  },
  // After a function completes
  onCallComplete: telemetry => {
    console.log("Telemetry (from onCallComplete):", telemetry);
  },
  // Before a command is processed
  onCommand: telemetry => {
    console.log("Telemetry (from onCommand):", telemetry);
  },
  // After a command is processed
  onCommandComplete: telemetry => {
    console.log("Telemetry (from onCommandComplete):", telemetry);
  }
}
```

### Telemetry output from `onCall`

```js
{
  // the function arguments
  args: [],
  fn: [Function: getPeople],
  // the effects-as-data config
  config:
   {
     name: 'getPeople',
     onCall: [Function: onCall],
     onCallComplete: [Function: onCallComplete],
     onCommand: [Function: onCommand],
     onCommandComplete: [Function: onCommandComplete],
     cid: [a unique string correlation id],
     //  the stack represents the effects-as-data call stack.  This is used when
     //  effects-as-data functions are chained together using cmds.call(fn)
     stack: [
       {config, handlers, fn: [Function: getPeople], args}
     ]
    }
  }
}
```

### Telemetry output from `onCallComplete`

```js
{
  // a boolean indicating if the function succeeded or threw an error
  success: true,
  // the function arguments
  args: [],
  fn: [Function: getPeople],
  // time started
  start: 1505229612164
  // time ended
  end: 1505229614506,
  // how long the function took to run
  latency: 2342,
  // what the function returned (or threw)
  result: [ 'Luke Skywalker', 'C-3PO' ],
  // the effects-as-data config
  config:
   {
     name: 'getPeople',
     onCall: [Function: onCall],
     onCallComplete: [Function: onCallComplete],
     onCommand: [Function: onCommand],
     onCommandComplete: [Function: onCommandComplete],
     cid: [a unique string correlation id],
     //  the stack represents the effects-as-data call stack.  This is used when
     //  effects-as-data functions are chained together using cmds.call(fn)
     stack: [
       {config, handlers, fn: [Function: getPeople], args}
     ]
    }
  }
}
```

### Telemetry output from `onCommand`

```js
{
  // the command
  command: {
    type: 'httpGet',
    url: 'https://swapi.co/api/people',
    headers: {},
    options: {}
  },
  // time command started to be processed,
  start: 1505229612164,
  // the step in the effects-as-data (ie, which yield)
  step: 0,
  // the index of the function in the above step (always 0 for a
  // single command.  Could be greater than 0 if parallelizing commands).
  index: 0,
  fn: [Function: getPeople],
  // the effects-as-data config
  config:
   {
     name: 'getPeople',
     onCall: [Function: onCall],
     onCallComplete: [Function: onCallComplete],
     onCommand: [Function: onCommand],
     onCommandComplete: [Function: onCommandComplete],
     cid: [a unique string correlation id],
     //  the stack represents the effects-as-data call stack.  This is used when
     //  effects-as-data functions are chained together using cmds.call(fn)
     stack: [
       {config, handlers, fn: [Function: getPeople], args}
     ]
    }
  }
}
```

### Telemetry output from `onCommandComplete`

```js
{
  // a boolean indicating if the function succeeded or threw an error
  success: true,
  // the command
  command: {
    type: 'httpGet',
    url: 'https://swapi.co/api/people',
    headers: {},
    options: {}
  },
  // time started
  start: 1505229612164
  // time ended
  end: 1505229614506,
  // how long the function took to run
  latency: 342,
  // the step in the effects-as-data (ie, which yield)
  step: 0,
  // the index of the function in the above step (always 0 for a
  // single command.  Could be greater than 0 if parallelizing commands).
  index: 0,
  // what is returned from the handler (or an error if the handler threw)
  result: [ 'Luke Skywalker', 'C-3PO' ],
  // the effects-as-data config
  config:
   {
     name: 'getPeople',
     onCall: [Function: onCall],
     onCallComplete: [Function: onCallComplete],
     onCommand: [Function: onCommand],
     onCommandComplete: [Function: onCommandComplete],
     cid: [a unique string correlation id],
     //  the stack represents the effects-as-data call stack.  This is used when
     //  effects-as-data functions are chained together using cmds.call(fn)
     stack: [
       {config, handlers, fn: [Function: getPeople], args}
     ]
    }
  }
}
```

## Testing

Testing in effects-as-data is really easy, even for complex asynchronous operations.  This is because effects-as-data functions are pure functions and only output JSON objects.  Effects-as-data tests don't make assertions; they simply declare a data-structure and the test runner validates that the inputs and outputs in the data structure match the inputs and outputs of the function.

Below are a few examples of testing with effects-as-data:

### Standard Test

```js
// get-person.js
const cmds = require('effects-as-data-universal')

function* getPerson(id) {
  const person = yield cmds.httpGet(`https://swapi.co/api/people/${id}`);
  return person.name;
}
```

```js
// get-person.spec.js
const { testFn, args } = require('effects-as-data/test')
const cmds = require('effects-as-data-universal')
const getPerson = require('./get-person')

const testGetPerson = testFn(getPerson)

describe('getPerson()', () => {
  it('should get a person return his/her name', testGetPerson(() => {
    return args(2)
      .yieldCmd(cmds.httpGet(`https://swapi.co/api/people/2`)).yieldReturns({ name: 'C-3P0'})
      .returns('C-3P0')
  }))
})
```

### Standard Test with Multiple Steps

```js
// get-people-with-same-name.js
const cmds = require('effects-as-data-universal')
const { postgres } = require('effects-as-data-postgres')

function* getPeopleWithSameName(id) {
  const person = yield cmds.httpGet(`https://swapi.co/api/people/${id}`);
  const peopleWSameName = yield postgres('SELECT * FROM users WHERE name = $1', [person.name])
  return peopleWSameName
}
```

```js
// get-person.spec.js
const { testFn, args } = require('effects-as-data/test')
const cmds = require('effects-as-data-universal')
const { postgres } = require('effects-as-data-postgres')
const getPeopleWithSameName = require('./get-person')

const testGetPeopleWithSameName = testFn(getPeopleWithSameName)

describe('getPeopleWithSameName()', () => {
  it('should get a person return his/her name', testGetPeopleWithSameName(() => {
    const dbResults = []
    const person = {
      id: 2,
      name: 'Foo'
    }
    return args(2)
      .yieldCmd(cmds.httpGet(`https://swapi.co/api/people/${person.id}`)).yieldReturns(person)
      .yieldCmd(postgres('SELECT * FROM users WHERE name = $1', [person.name])).yieldReturns(dbResults)
      .returns(dbResults)
  }))
})
```

### Short Return

When your code does nothing to the result of the command and returns it immediately.

```js
// get-person.js
const cmds = require('effects-as-data-universal')

function* getPerson(id) {
  return yield cmds.httpGet(`https://swapi.co/api/people/${id}`);
}
```

```js
// get-person.spec.js
const { testFn, args } = require('effects-as-data/test')
const cmds = require('effects-as-data-universal')
const getPerson = require('./get-person')

const testGetPerson = testFn(getPerson)

describe('getPerson()', () => {
  it('should get a person return his/her name', testGetPerson(() => {
    return args(2)
      .yieldCmd(cmds.httpGet(`https://swapi.co/api/people/2`)).returns({ name: 'C-3P0'})
  }))
})
```

### Test that an error is thrown from your code

This does not apply to errors are thrown by handlers.  Errors thrown by handlers don't need to be tested because they are handled by effects-as-data.

```js
// get-person.js
const cmds = require('effects-as-data-universal')

function* getPerson(id) {
  const result = yield cmds.httpGet(`https://swapi.co/api/people/${id}`);
  if (!result.name) throw new Error('No Name!')
  return result
}
```

```js
// get-person.spec.js
const { testFn, args } = require('effects-as-data/test')
const cmds = require('effects-as-data-universal')
const getPerson = require('./get-person')

const testGetPerson = testFn(getPerson)

describe('getPerson()', () => {
  it('should get a person return his/her name', testGetPerson(() => {
    return args(2)
      .yieldCmd(cmds.httpGet(`https://swapi.co/api/people/2`)).returns({ name: 'C-3P0'})
  }))

  it('should throw an error if person has no name', testGetPerson(() => {
    return args(2)
      .yieldCmd(cmds.httpGet(`https://swapi.co/api/people/2`)).yieldReturns({ name: '' })
      .throws(new Error('No Name!'))
  }))
})
```

### Test that an error is re-thrown from a handler

```js
// get-person.js
const cmds = require('effects-as-data-universal')

function* getPerson(id) {
  try {
    return yield cmds.httpGet(`https://swapi.co/api/people/${id}`);
  } catch (e) {
    throw new Error('some other error')
  }
}
```

```js
// get-person.spec.js
const { testFn, args } = require('effects-as-data/test')
const cmds = require('effects-as-data-universal')
const getPerson = require('./get-person')

const testGetPerson = testFn(getPerson)

describe('getPerson()', () => {
  it('should get a person return his/her name', testGetPerson(() => {
    return args(2)
      .yieldCmd(cmds.httpGet(`https://swapi.co/api/people/2`)).returns({ name: 'C-3P0'})
  }))

  it('should catch and throw a different error', testGetPerson(() => {
    return args(2)
      .yieldCmd(cmds.httpGet(`https://swapi.co/api/people/2`)).yieldThrows(new Error('oops'))
      .throws(new Error('some other error'))
  }))
})
```

## Declarative Application Architecture

The DAA is an architecture wherein all business logic functions in the application are pure functions, the outputs of which declare side effects with plain JSON objects (these declarations are also known as “commands”).  Applications written using DAA do not need dependency injection, singletons, globals, etc, to use side effect producing code in a testable manner.  Business logic functions in DAA do not have dependencies on or references to side effect producing code and do nothing but output plain JSON commands.  Writing all business logic with highly testable, pure functions and not having to be concerned with how dependencies are accessed throughout the application contribute to a dramatic increase in developer velocity for new applications and while refactoring existing DAA applications.

![Declarative Application Architecture](https://s3-us-west-2.amazonaws.com/effects-as-data/daa.png)
