# Effects-as-data

Effects-as-data is a micro abstraction layer for Javascript that makes writing, [testing](https://github.com/orourkedd/effects-as-data#second-test-your-business-logic), and [monitoring](https://github.com/orourkedd/effects-as-data#fifth-optionally-setting-up-monitoring--telemetry) side-effects easy.

* Using effects-as-data can dramatically reduce the time it takes to deliver tested code.
* Effects-as-data outputs detailed telemetry, during runtime, allowing you to see every side-effect (HTTP, Disk IO, etc), its latency, and its result giving you insight into your code while it runs in development and production.
* Effects-as-data is ~1kb minified+gzipped.
* Effects-as-data has *almost* no performance overhead (see `npm run perf`).
* Anywhere you can use promises, you can use effects-as-data.

## Table of Contents
* [Example Projects](#example-projects)
* [Usage in Node and the Browser](#usage-in-node-and-the-browser-es6-and-es5)
* [Getting Started From Scratch](#getting-started-from-scratch)
* [Getting Starting Using Existing Commands and Handlers](#getting-started-from-scratch)
* [Error handling](#error-handling)
* [Parallelization of Commands](#parallelization-of-commands)
* [Telemetry](#telemetry)
* [Testing](#testing)

## Example Projects

There are several working examples in `effects-as-data-examples`: [Open](https://github.com/orourkedd/effects-as-data-examples)

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
    // prettier-ignore
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
  // prettier-ignore
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

This example demonstrates handling errors with `either`.  Unlike the above examples, this example has been separated into a few files showing more what production code looks like.

Below is the `getPeople` function.  Notice the use of `cmds.either`.  The `either` handler will process the `httpGet` command, and if the command is successful, will return the response.  If the `httpGet` command fails or returns a falsey value, the `either` handler will return `emptyResults`.  Because the `either` handler will never throw an exception and will either return a successful result or `emptyResults`, there is no need for an `if` statement to ensure success before the `map`.  Using this pattern will reduce the number of code paths and simplify code.
```js
const { cmds } = require('effects-as-data-universal')

function* getPeople() {
  const httpGet = cmds.httpGet('https://swapi.co/api/people')
  const emptyResults = { payload: { results: [] } }
  const { payload } = yield cmds.either(httpGet, emptyResults)
  return payload.results.map(p => p.name)
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
    const apiResults = { payload: { results: [{ name: 'Luke Skywalker' }] } }
    const httpGet = cmds.httpGet('https://swapi.co/api/people')
    const emptyResults = { payload: { results: [] } }
    // prettier-ignore
    return args()
      .yieldCmd(cmds.either(httpGet, emptyResults)).yieldReturns(apiResults)
      .returns(['Luke Skywalker'])
  })
)

test(
  'getPeople should return an empty list if http get errors out',
  testGetPeople(() => {
    const apiResults = { payload: { results: [{ name: 'Luke Skywalker' }] } }
    const httpGet = cmds.httpGet('https://swapi.co/api/people')
    const emptyResults = { payload: { results: [] } }
    // prettier-ignore
    return args()
      .yieldCmd(cmds.either(httpGet, emptyResults)).yieldReturns(emptyResults)
      .returns([])
  })
)
```

The index file that runs it.  `onCommandComplete` is removed for brevity:
```js
const { call, buildFunctions } = require('effects-as-data')
const { handlers } = require('effects-as-data-universal')
const getPeople = require('./get-people')

const functions = buildFunctions({}, handlers, { getPeople })

functions
  .getPeople()
  .then(names => {
    console.log('Function Results:')
    console.log(names.join(', '))
  })
  .catch(console.error)

```

## Parallelization of commands

Full example: [https://github.com/orourkedd/effects-as-data-examples/tree/master/parallelization](https://github.com/orourkedd/effects-as-data-examples/tree/master/parallelization).

```js
const { cmds } = require('effects-as-data-universal')

function* getPeople(person1, person2) {
  const httpGet1 = cmds.httpGet(`https://swapi.co/api/people/${person1}`)
  const httpGet2 = cmds.httpGet(`https://swapi.co/api/people/${person2}`)
  const [result1, result2] = yield [httpGet1, httpGet2]
  return [result1.payload, result2.payload].map(p => p.name)
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
    const apiResult1 = { payload: { name: 'Luke Skywalker' } }
    const apiResult2 = { payload: { name: 'C-3PO' } }
    const httpGet1 = cmds.httpGet('https://swapi.co/api/people/1')
    const httpGet2 = cmds.httpGet('https://swapi.co/api/people/2')
    // prettier-ignore
    return args(1, 2)
      .yieldCmd([httpGet1, httpGet2]).yieldReturns([apiResult1, apiResult2])
      .returns(['Luke Skywalker', 'C-3PO'])
  })
)
```

The index file that runs it.  `onCommandComplete` is removed for brevity:
```js
const { call, buildFunctions } = require('effects-as-data')
const { handlers } = require('effects-as-data-universal')
const getPeople = require('./get-people')

const functions = buildFunctions({}, handlers, { getPeople })

functions
  .getPeople(1, 2)
  .then(names => {
    console.log('Function Results:')
    console.log(names.join(', '))
  })
  .catch(console.error)
```

## Telemetry

Coming soon

## Testing

Coming soon
