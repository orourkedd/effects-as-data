# Effects-as-data

Effects-as-data is a micro abstraction layer for Javascript that makes writing, **testing**, and monitoring side-effects easy.

* Using effects-as-data can reduce the time you spend testing by 2-3 times (maybe more depending on who you ask).
* Effects-as-data outputs a `command` log allowing you to see every side-effect (HTTP, Disk IO, etc), its latency, and its result giving you detailed insight into your code while it runs in development and production.
* Effects-as-data is <1kb minified+gzipped.
* Effects-as-data has *almost* no performance overhead (see `npm run perf`).

## Effects-as-data by example

### Getting Started (from scratch)

#### First, create a command creator.
This function creates a plain JSON `command` object that effects-as-data will pass to a handler function which will perform the actual HTTP request.  The `type` field on the command matches the name of the handler to which it will be passed.
```js
function httpGetCommand(url) {
  return {
    type: 'httpGet',
    url
  }
}
```

#### Second, test your business logic.
Write a test for `getPeople` function that you are about to create.  These tests can be used stand-alone or in any test runner like Jest, Mocha, etc.  There are a few ways to test `effects-as-data` functions demonstrated below.

Semantic test example:
```js
const { testFn, args } = require('effects-as-data/test')

testFn(getPeople, () => {
  const apiResults = { results: [{ name: 'Luke Skywalker' }] }
  return args()
    .yieldCmd(httpGetCommand('https://swapi.co/api/people')).yieldReturns(apiResults)
    .returns(['Luke Skywalker'])
})()
```

Using only data (v2):
```js
const { testFnV2, args } = require('effects-as-data/test')

testFnV2(getPeople, () => {
  const apiResults = { results: [{ name: 'Luke Skywalker' }] }
  return [
    [],
    [httpGetCommand('https://swapi.co/api/people'), apiResults],
    ['Luke Skywalker']
  ]
})()
```

Using only data (v1):
```js
const { testFn } = require('effects-as-data/test')

testFn(getPeople, () => {
  const apiResults = { results: [{ name: 'Luke Skywalker' }] }
  return [
    [[], httpGetCommand('https://swapi.co/api/people')],
    [apiResults, ['Luke Skywalker']]
  ]
})()
```

#### Third, write your business logic.
Effects-as-data uses a generator function's ability to give up execution flow and to pass a value to an outside process using the `yield` keyword.  You create `command` objects in your business logic and `yield` them to effects-as-data.
```js
function* getPeople() {
  const { results } = yield httpGetCommand('https://swapi.co/api/people')
  const names = results.map(p => p.name)
  return names
}
```

#### Fourth, create a command handler.
After the `command` object is `yield`ed, effects-as-data will pass it to a handler function that will perform the side-effect producing operation (in this case, an HTTP GET request).
```js
function httpGetHandler(cmd) {
  return fetch(cmd.url).then(r => r.json())
}
```

#### Fifth, setting up monitoring / telemetry.
The effects-as-data config accepts an `onCommandComplete` callback which will be called every time a `command` completes, giving detailed information about the operation.  This data can be logged to the console or sent to a logging service.
```js
const config = {
  onCommandComplete: telemetry => {
    console.log('Telemetry (from onCommandComplete):', telemetry)
  }
}
```

#### Sixth, wire everything up.
This will turn your effects-as-data functions into normal, promise-returning functions.  In this case, `functions` will be an object with one key, `getPeople`, which will be a promise-returning function.
```js
const functions = buildFunctions(
  config,
  { httpGet: httpGetHandler },
  { getPeople }
)
```

#### Lastly, use your functions.
Once you have built your functions, you can use them like normal promise-returning functions anywhere in your application.
```js
functions
  .getPeople()
  .then(names => {
    console.log('\n')
    console.log('Function Results:')
    console.log(names.join(', '))
  })
  .catch(console.error)

```

Turn your effects-as-data functions into normal promise-returning functions.

#### Full Example

See full example in the `effects-as-data-examples` repository: [https://github.com/orourkedd/effects-as-data-examples/blob/master/basic/index.js](https://github.com/orourkedd/effects-as-data-examples/blob/master/basic/index.js).

You can run this example by cloning `https://github.com/orourkedd/effects-as-data-examples` and running `npm run basic`.

### Using existing commands and handlers
This example demonstrates using the `effects-as-data-universal` module with contains commands/handler that can be used anywhere Javascript runs.

Full example: [https://github.com/orourkedd/effects-as-data-examples/blob/master/basic-existing-handlers/index.js](https://github.com/orourkedd/effects-as-data-examples/blob/master/basic-existing-handlers/index.js).

Run it: Clone `https://github.com/orourkedd/effects-as-data-examples` and run `npm run basic-existing-handlers`.

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

### Error handling

This example demonstrates handling errors with `either`.  Unlike the above examples, this example has been separated into a few files showing more what production code looks like.

Full example: [https://github.com/orourkedd/effects-as-data-examples/tree/master/error-handling](https://github.com/orourkedd/effects-as-data-examples/tree/master/error-handling).

Run it: Clone `https://github.com/orourkedd/effects-as-data-examples` and run `npm run error-handling`.

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

### Parallelization of commands

Full example: [https://github.com/orourkedd/effects-as-data-examples/tree/master/parallelization](https://github.com/orourkedd/effects-as-data-examples/tree/master/parallelization).

Run it: Clone `https://github.com/orourkedd/effects-as-data-examples` and run `npm run parallelization`.

```js
const { cmds } = require('effects-as-data-universal')

function* getPeople() {
  const httpGet1 = cmds.httpGet('https://swapi.co/api/people/1')
  const httpGet2 = cmds.httpGet('https://swapi.co/api/people/2')
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
    return args()
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
  .getPeople()
  .then(names => {
    console.log('Function Results:')
    console.log(names.join(', '))
  })
  .catch(console.error)
```
