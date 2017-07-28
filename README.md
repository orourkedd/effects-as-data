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

#### Second, write your business logic.
Effects-as-data uses a generator function's ability to give up execution flow and to pass a value to an outside process using the `yield` keyword.  You create `command` objects in your business logic and `yield` them to effects-as-data.
```js
function* getPeople() {
  const { results } = yield httpGetCommand('https://swapi.co/api/people')
  const names = results.map(p => p.name)
  return names
}
```

#### Third, create a command handler.
After the `command` object is `yield`ed, effects-as-data will pass it to a handler function that will perform the side-effect producing operation (in this case, an HTTP GET request).
```js
function httpGetHandler(cmd) {
  return fetch(cmd.url).then(r => r.json())
}
```

#### Fourth, setting up monitoring / telemetry.
The effects-as-data config accepts an `onCommandComplete` callback which will be called every time a `command` completes, giving detailed information about the operation.  This data can be logged to the console or sent to a logging service.
```js
const config = {
  onCommandComplete: telemetry => {
    console.log('Telemetry (from onCommandComplete):', telemetry)
  }
}
```

#### Fifth, wire everything up.
This will turn your effects-as-data functions into normal, promise-returning functions.  In this case, `functions` will be an object with one key, `getPeople`, which will be a promise-returning function.
```js
const functions = buildFunctions(
  config,
  { httpGet: httpGetHandler },
  { getPeople }
)
```

#### Sixth, use your functions.
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

### Full Example

```js
const { call, buildFunctions } = require('effects-as-data')
const fetch = require('isomorphic-fetch')

function httpGetCommand(url) {
  return {
    type: 'httpGet',
    url
  }
}

function httpGetHandler(cmd) {
  return fetch(cmd.url).then(r => r.json())
}

function* getPeople() {
  const { results } = yield httpGetCommand('https://swapi.co/api/people')
  const names = results.map(p => p.name)
  return names
}

const config = {
  onCommandComplete: telemetry => {
    console.log('Telemetry (from onCommandComplete):', telemetry)
  }
}

const functions = buildFunctions(
  config,
  { httpGet: httpGetHandler },
  { getPeople }
)

functions
  .getPeople()
  .then(names => {
    console.log('\n')
    console.log('Function Results:')
    console.log(names.join(', '))
  })
  .catch(console.error)
```

### Using existing commands and handlers

```js
const { call, buildFunctions } = require('../index')
const { cmds, handlers } = require('effects-as-data-universal')

// Pure business logic functions
function* getUsers() {
  return yield cmds.httpGet('http://example.com/api/users')
}

function* getUserPosts(userId) {
  return yield cmds.httpGet(`http://example.com/api/user/${userId}/posts`)
}

// Use onCommandComplete to gather telemetry
const config = {
  onCommandComplete: telemetry => {
    console.log('Telemetry:', telemetry)
  }
}

// Turn effects-as-data functions into normal,
// promise-returning functions
const functions = buildFunctions(
  config,
  handlers, // command handlers
  { getUsers, getUserPosts } // effects-as-data functions
)

// Use the functions like you normally would
functions.getUsers().then(console.log)
```
