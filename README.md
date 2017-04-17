# Effects as Data

`effects-as-data` is a library that allows you to express your business logic using only pure functions, anywhere that Javascript runs.  `effects-as-data` makes it easy to reason about your code and makes it hard to write hard-to-test code, getting rid of the need for mocks, stubs, spies, globals, and interaction testing.

## Why use effects as data?

* It makes development faster.
* Its hard to write hard-to-test code.  **If you like testing, you'll love effects-as-data.**
* Service discovery is no longer a thing.  No need for dependency injection, exposing services as singletons, etc.  Services and state are available everywhere all the time, without being global.
* All business logic is expressed using **only** pure functions.
* One testing methodology for everything.  Say goodbye to mocks, stubs, spies, globals, and interaction testing.  Just pure-function, `deepEqual(input, output)` style testing.
* Logicless tests.  *Tests have no assertions.*
* Decouple protocol from implementation.
* Independently monitor all side effects in the system.

## Examples

### Express
![use with Express](https://github.com/orourkedd/effects-as-data-projects/tree/master/express)

### Traditional Javascript vs Effects-as-data
A side-by-side example of the same code written in traditional-style javascript and in effects-as-data: https://github.com/orourkedd/effects-as-data-vs-side-effects.  This came from a talk given at the Pluralsight Tech Summit.

## Installation
```sh
npm i --save effects-as-data
```

### Try It
You can run the code below using this command.  You can see the code [here](https://github.com/orourkedd/effects-as-data/tree/master/src/demo-cli).
```sh
npm install
npm run demo
```

### Effects-as-data lifecycle
![Effects-as-data lifecycle](https://s3-us-west-2.amazonaws.com/effects-as-data/effects-as-data-diagram-v1.jpg)

## Usage

### Write a pure function expressing your business logic
Define a pure function that `effects-as-data` can use to perform your business logic.  This function coordinates your workflow.  The function below does a lot and would normally be difficult to test:
* Reads user input (a Github username).
* Does a GET request to Github for the user's repositories.
* Prints an array of the user's repository names.
* Returns the array of repository names.

NOTE: `prompt`, `httpGet`, `logInfo` below are pure functions which only return JSON objects.  They are not actually `prompt`ing, `httpGet`ing, etc.  `effects-as-data` routes these JSON objects to handlers that do the side-effect-producing, hard-to-test part for you.  The code below performs no side-effects, nor does it have any reference to side-effect-producing code.

You can find this in [`demo-cli/functions/save-repositories.js`](https://github.com/orourkedd/effects-as-data/blob/master/src/demo-cli/functions/save-repositories.js)

```js
const { actions, isFailure } = require('effects-as-data/node')
const { pluck } = require('ramda')
const getListOfNames = pluck(['name'])

const saveRepositories = function * (filename) {
  const {payload: username} = yield actions.prompt('\nEnter a github username: ')
  const repos = yield actions.httpGet(`https://api.github.com/users/${username}/repos`)
  if (isFailure(repos)) return repos
  const names = getListOfNames(repos.payload)
  yield actions.logInfo(names.join('\n'))
  return names
}

module.exports = {
  saveRepositories
}
```

### Test It
Test your business logic using logic-less tests.  Each tuple in the array is an input-output pair.  You can find this in [`demo-cli/functions/save-repositories.spec.js`](https://github.com/orourkedd/effects-as-data/blob/master/src/demo-cli/functions/save-repositories.spec.js):
```js
const { testIt } = require('effects-as-data/test')
const { saveRepositories } = require('./save-repositories')
const { actions, failure } = require('effects-as-data/node')

const testSaveRepositories = testIt(saveRepositories)

describe('saveRepositories()', () => {
  it('should get repositories and print names', testSaveRepositories(() => {
    const repos = [
      { name: 'foo' },
      { name: 'bar' }
    ]
    return [
      ['repos.json', actions.prompt('\nEnter a github username: ')],
      ['orourkedd', actions.httpGet('https://api.github.com/users/orourkedd/repos')],
      [repos, actions.logInfo('foo\nbar')],
      [null, ['foo', 'bar']]
    ]
  }))

  it('should return http GET failure', testSaveRepositories(() => {
    const httpError = new Error('http error!')
    return [
      ['repos.json', actions.prompt('\nEnter a github username: ')],
      ['orourkedd', actions.httpGet('https://api.github.com/users/orourkedd/repos')],
      [failure(httpError), failure(httpError)]
    ]
  }))
})


```

### Debug
If your tests are failing, you get a message like this:

```
Error on Step 4

Actual:
{ type: 'writeFile',
  path: 'wrong-path.json',
  data: '...
}

Expected:
{ type: 'writeFile',
  path: 'repos.json',
  data: '...'
}
```

### Wire It Up and Run It
Fifth, wire it all up.  You can find this in [`demo-cli/index.js`](https://github.com/orourkedd/effects-as-data/blob/master/src/demo-cli/index.js):
```js
const { run, handlers } = require('effects-as-data/node')
const { saveRepositories } = require('./functions/save-repositories')

run(handlers, saveRepositories, 'repos.json').catch(console.error)

```

## Logging Action Failures

Logging all action failures explicitly can add a lot of noise to your code.  Effects-as-data provides an `onFailure` hook that will be called for each failed action with a detailed payload about the error.  **This allows for every effect in the system to be independently monitored and reported on, automatically.**

```js
function onFailure (payload) {
  //  payload:
  //  {
  //   fn: 'saveRepositories',
  //   log: [
  //     [42, {type: 'firstAction'}],
  //     [{success: true, payload: 'something from firstAction'}, {type: 'theFailingAction'}]
  //   ],
  //   failure: {
  //     success: false,
  //     error: {
  //       message: 'Some happened on this line for that reason'
  //     }
  //   },
  //   action: {type: 'theFailingAction'}
  // }

  myLoggingFn(payload)
}

function * test () {
  yield { type: 'firstAction' }
  yield { type: 'theFailingAction' }
}

return run(handlers, test, 42, {
  name: 'testFunction',
  onFailure
})
```

# Actions packaged with effects-as-data

### Table of Contents

-   [env](#env)
-   [readFile](#readfile)
-   [writeFile](#writefile)
-   [prompt](#prompt)
-   [requireModule](#requiremodule)
-   [call](#call)
-   [echo](#echo)
-   [guid](#guid)
-   [httpGet](#httpget)
-   [httpPost](#httppost)
-   [httpPut](#httpput)
-   [httpDelete](#httpdelete)
-   [jsonParse](#jsonparse)
-   [logInfo](#loginfo)
-   [logError](#logerror)
-   [now](#now)
-   [randomNumber](#randomnumber)
-   [getState](#getstate)
-   [setState](#setstate)

## env

[src/actions/node/env.js:33-37](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/node/env.js#L33-L37 "Source code on GitHub")

Create an `env` action.  `yield` an env action get `process.env`.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should return the environment', testExample(() => {
    return [
      [null, actions.env()],
      [{ NODE_ENV: 'development' }, success({ NODE_ENV: 'development' })]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/node')

function * example () {
  const result = yield actions.env()
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/node')

run(handlers, example).then((env) => {
  env.payload.NODE_ENV === 'development' //  true, if process.env.NODE_ENV === 'development'
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `env`.

## readFile

[src/actions/node/fs.js:37-44](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/node/fs.js#L37-L44 "Source code on GitHub")

Creates a `readFile` action.  `yield` a `readFile` action to read a file using `fs.readFile`.

**Parameters**

-   `file` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** file path
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** options for `fs.readFile` (optional, default `{}`)
-   `path`  

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/node')

const testExample = testIt(example)

describe('example()', () => {
  it('should read a file', testExample(() => {
    const path = '/path/to/file.txt'
    return [
      [{ path }, actions.readFile(path, { encoding: 'utf8' })],
      ['FOO', success()]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/node')

function * example ({ path }) {
  const result = yield actions.readFile(path, { encoding: 'utf8' })
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/node')

run(handlers, example, { path: '/path/to/file.txt' }).then((result) => {
  result.payload === 'FOO' //  true, if '/path/to/file.txt' has the content 'FOO'.
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `readFile`.

## writeFile

[src/actions/node/fs.js:84-91](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/node/fs.js#L84-L91 "Source code on GitHub")

Creates a `writeFile` action.  `yield` a `writeFile` action to write a file using `fs.writeFile`.

**Parameters**

-   `file` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** file path
-   `the` **any** contents to write
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** options for `fs.writeFile` (optional, default `{}`)
-   `path`  
-   `data`  

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')

const testExample = testIt(example)

describe('example()', () => {
  it('should write a file', testExample(() => {
    const path = '/path/to/file.txt'
    const contents = 'BAR'
    return [
      [{ path, contents }, writeFile(path, contents, { encoding: 'utf8' })],
      //  expect a `success` from writeFile and for the function to return the `success`
      [success(), success()]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/node')

function * example ({ path, contents }) {
  const result = yield actions.writeFile(path, contents, { encoding: 'utf8' })
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/node')

run(handlers, example, { path: '/path/to/file.txt', contents: 'FOO' }).then((result) => {
  result.success === true && result.payload === null //  true, if write to '/path/to/file.txt' was successful.
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `writeFile`.

## prompt

[src/actions/node/prompt.js:35-40](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/node/prompt.js#L35-L40 "Source code on GitHub")

Creates a `prompt` action.  `yield` a `prompt` action read input form a user from the command line.

**Parameters**

-   `question` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** prompt for the user

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/node')

const testExample = testIt(example)

describe('example()', () => {
  it('should prompt the user', testExample(() => {
    return [
      [null, actions.prompt("What's your favorite color?")],
      ['green', success('green')]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/node')

function * example () {
  const result = yield actions.prompt("What's your favorite color?")
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/node')

run(handlers, example).then((result) => {
  result.payload === 'green' //  true, if the user typed "green" on the command line.
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `prompt`.

## requireModule

[src/actions/node/require-module.js:35-40](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/node/require-module.js#L35-L40 "Source code on GitHub")

Creates a `requireModule` action.  `yield` a `requireModule` action to require a module.

**Parameters**

-   `the` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** absolute path to the module.
-   `path`  

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/node')

const testExample = testIt(example)

describe('example()', () => {
  it('should require a module', testExample(() => {
    return [
      [null, actions.requireModule('/path/to/my-module')],
      [{ foo: 'bar' }, success({ foo: 'bar' })]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/node')

function * example () {
  const result = yield actions.requireModule('/path/to/my-module')
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/node')

run(handlers, example).then((result) => {
  result.payload == { foo: 'bar' } //  true
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `requireModule`.

## call

[src/actions/universal/call.js:43-50](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/call.js#L43-L50 "Source code on GitHub")

Creates a `call` action.  `yield` a `call` action to call another effects-as-data function.  `call` is used to compose effects-as-data functions in a testible manner.

**Parameters**

-   `fn` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** an effects-as-data generator function.
-   `payload` **any?** the payload for the effects-as-data function.
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** options for `call` (optional, default `{}`)

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

const testExample = testIt(example)

describe('example()', () => {
  it('should call an effects-as-data function', testExample(() => {
    return [
      ['123', actions.call(getUser, { id: '123' })],
      [{ id: '123', username: 'foo' }, success({ id: '123', username: 'foo' })]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * getUser ({ id }) {
 const user = yield actions.httpGet(`https://example.com/api/v1/users/${id}`)
 return user
}

function * example ({ id }) {
  const result = yield actions.call(getUser, { id })
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example, { id: '123' }).then((user) => {
  user.payload.id === '123' //  true
  user.payload.username === 'foo' //  true, if a user with an id of '123' has the `username` 'foo'.
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `call`.

## echo

[src/actions/universal/echo.js:35-40](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/echo.js#L35-L40 "Source code on GitHub")

Creates an `echo` action.  `yield` an `echo` action for the handler to return `payload`.  This is used as a placeholder when multiple actions are being `yield`ed and some of the actions need to be `yield`ed conditionally.

**Parameters**

-   `payload` **any** the value to be returns from the handler.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should return its argument', testExample(() => {
    const value = { foo: 'bar' }
    return [
      [{ value }, actions.echo(value)],
      [value, success(value)]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example ({ value }) {
  const result = yield actions.echo(value)
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example, { value: 32 }).then((result) => {
  result.payload === 32 //  true
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `echo`.

## guid

[src/actions/universal/guid.js:33-37](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/guid.js#L33-L37 "Source code on GitHub")

Creates a `guid` action.  `yield` a `guid` action to get a shiny new guid.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should return a guid', testExample(() => {
    return [
      [null, actions.guid()],
      ['83feb66e-cf36-40a3-ad23-a150f0b7ed4d', success('83feb66e-cf36-40a3-ad23-a150f0b7ed4d')]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example () {
  const result = yield actions.guid()
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example).then((result) => {
  result.payload === '15270902-2798-4c34-aaa8-9a55726b58af' //  true, if `uuid.v4()` returned '15270902-2798-4c34-aaa8-9a55726b58af'
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `guid`.

## httpGet

[src/actions/universal/http.js:43-50](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/http.js#L43-L50 "Source code on GitHub")

Creates a `httpGet` action.  `yield` an `httpGet` action to do an http GET request.

**Parameters**

-   `url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the url to GET.
-   `headers` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** request headers. (optional, default `{}`)
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** options for `fetch`. (optional, default `{}`)

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should return a result from GET', testExample(() => {
    return [
      [{ url: 'http://www.example.com' }, actions.httpGet('http://www.example.com')],
      [{ foo: 'bar' }, success({ foo: 'bar' })]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example ({ url }) {
  const result = yield actions.httpGet(url)
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

const url = 'https://www.example.com/api/v1/something'
run(handlers, example, { url }).then((result) => {
  result.payload === { foo: 'bar' } //  true, if a GET to `url` returned `{ foo: 'bar' }`
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `httpGet`.

## httpPost

[src/actions/universal/http.js:89-97](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/http.js#L89-L97 "Source code on GitHub")

Creates a `httpPost` action.  `yield` an `httpPost` action to do an http POST request.

**Parameters**

-   `url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the url to POST.
-   `payload` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** the payload to POST.
-   `headers` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** request headers. (optional, default `{}`)
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** options for `fetch`. (optional, default `{}`)

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should POST payload to url', testExample(() => {
    const url = 'http://www.example.com/api/v1/user'
    return [
      [{ url }, actions.httpPost(url, { foo: 'bar' })],
      [success(), success()]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example (payload) {
  const result = yield actions.httpPost('http://www.example.com/api/v1/user', payload)
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example, { foo: 'bar' }).then((result) => {
  result.success === true //  true, if a POST was successful
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `httpPost`.

## httpPut

[src/actions/universal/http.js:136-144](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/http.js#L136-L144 "Source code on GitHub")

Creates a `httpPut` action.  `yield` an `httpPut` action to do an http PUT request.

**Parameters**

-   `url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the url to PUT.
-   `payload` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** the payload to PUT.
-   `headers` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** request headers. (optional, default `{}`)
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** options for `fetch`. (optional, default `{}`)

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should PUT payload to url', testExample(() => {
    const url = 'http://www.example.com/api/v1/user'
    return [
      [{ url }, actions.httpPut(url, { foo: 'bar' })],
      [success(), success()]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example (payload) {
  const result = yield actions.httpPut('http://www.example.com/api/v1/user', payload)
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example, { foo: 'bar' }).then((result) => {
  result.success === true //  true, if a PUT was successful
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `httpPut`.

## httpDelete

[src/actions/universal/http.js:181-188](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/http.js#L181-L188 "Source code on GitHub")

Creates a `httpDelete` action.  `yield` an `httpDelete` action to do an http DELETE request.

**Parameters**

-   `url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the url to DELETE.
-   `headers` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** request headers. (optional, default `{}`)
-   `options` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** options for `fetch`. (optional, default `{}`)

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should return a result from DELETE', testExample(() => {
    return [
      [{ id: '32' }, actions.httpDelete('http://www.example.com/api/v1/user/32')],
      [success(), success())]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example ({ id }) {
  const result = yield actions.httpDelete(`http://www.example.com/api/v1/user/${id}`)
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example, { id: '123' }).then((result) => {
  result.success === true //  true, if a DELETE to http://www.example.com/api/v1/user/123 was successful
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `httpDelete`.

## jsonParse

[src/actions/universal/json-parse.js:35-40](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/json-parse.js#L35-L40 "Source code on GitHub")

Creates a `jsonParse` action.  `yield` a `jsonParse` action to parse a JSON string.  Why not just use `JSON.parse()` inline?  Although a successful parsing operation is deterministic, a failed parsing operation is not.

**Parameters**

-   `payload` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the JSON string to parse.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

const testExample = testIt(example)

describe('example()', () => {
  it('should parse a JSON string', testExample(() => {
    return [
      [{ json: '{"foo": "bar"}' }, actions.jsonParse('{"foo": "bar"}')],
      [{ foo: 'bar' }, success({ foo: 'bar' })]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example ({ json }) {
  const result = yield actions.jsonParse(json)
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example, { json: '{"foo": "bar"}' }).then((result) => {
  result.payload.foo === 'bar' //  true
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `jsonParse`.

## logInfo

[src/actions/universal/log.js:35-40](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/log.js#L35-L40 "Source code on GitHub")

Creates a `logInfo` action.  `yield` a `logInfo` action to log to the console using `console.info`.

**Parameters**

-   `payload` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?** the payload to log.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

const testExample = testIt(example)

describe('example()', () => {
  it('should log a message', testExample(() => {
    return [
      [{ message: 'foo' }, actions.logInfo('foo')],
      [null, success()]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example ({ message }) {
  const result = yield actions.logInfo(message)
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example, { message: 'bar' }).then((result) => {
  //  "bar" should have been `console.info`ed
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `logInfo`.

## logError

[src/actions/universal/log.js:76-81](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/log.js#L76-L81 "Source code on GitHub")

Creates a `logError` action.  `yield` a `logError` action to log to the console using `console.error`.

**Parameters**

-   `payload` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?** the payload to log.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

const testExample = testIt(example)

describe('example()', () => {
  it('should log a message', testExample(() => {
    return [
      [{ message: 'foo' }, actions.logError('foo')],
      [null, success()]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example ({ message }) {
  const result = yield actions.logError(message)
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example, { message: 'bar' }).then((result) => {
  //  "bar" should have been `console.error`ed
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `logError`.

## now

[src/actions/universal/now.js:33-37](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/now.js#L33-L37 "Source code on GitHub")

Create an `now` action.  `yield` a `now` action to get the current timestamp from `Date.now()`.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should return the current timestamp', testExample(() => {
    return [
      [null, actions.now()],
      [123456, success(123456)]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example () {
  const timestamp = yield actions.now()
  return timestamp
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example).then((timestamp) => {
  timestamp.payload === 1490030160103 //  true, if Date.now() returned 1490030160103
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `now`.

## randomNumber

[src/actions/universal/random-number.js:33-37](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/random-number.js#L33-L37 "Source code on GitHub")

Create an `randomNumber` action.  `yield` a `randomNumber` to get a random number using `Math.random()`.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should return the current timestamp', testExample(() => {
    return [
      [null, actions.randomNumber()],
      [0.123, success(0.123)]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example () {
  const n = yield actions.randomNumber()
  return n
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example).then((n) => {
  n.payload === 0.345 //  true, if Math.random() returned 0.345
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `randomNumber`.

## getState

[src/actions/universal/state.js:34-39](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/state.js#L34-L39 "Source code on GitHub")

Creates a `getState` action.  `yield` a `getState` to get application state.

**Parameters**

-   `keys` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array of paths to sections of state.  For example, ['user.firstName', 'settings.showBanner']

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should return user from application state', testExample(() => {
    return [
      [null, actions.getState(['user'])],
      [{ id: '123', username: 'foo' }, success({ id: '123', username: 'foo' })]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example () {
  const user = yield actions.getState(['user'])
  return user
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

run(handlers, example).then((user) => {
  user.id === 'abc' //  true, if the user has an `id` of 'abc'
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `getState`.

## setState

[src/actions/universal/state.js:76-81](https://github.com-orourkedd/orourkedd/effects-as-data/blob/da7c6768fa7dfc99630600a48caa1dcf34783497/src/actions/universal/state.js#L76-L81 "Source code on GitHub")

Creates a `setState` action.  `yield` a `setState` to set application state.

**Parameters**

-   `payload` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** An object that will be `merge`ed into the application state.

**Examples**

```javascript
//  Test It
const { testIt } = require('effects-as-data/test')
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')
const testExample = testIt(example)

describe('example()', () => {
  it('should set a user on the application state', testExample(() => {
    const user = { user: '123' }
    return [
      [user, actions.setState({ user })],
      [null, success()]
    ]
  }))
})
```

```javascript
//  Write It
const { actions } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

function * example (user) {
  const result = yield actions.setState({ user })
  return result
}
```

```javascript
//  Run It
const { handlers, run } = require('effects-as-data/universal') //  also available in require('effects-as-data/node')

const user = { id: '123', username: 'foo' }
run(handlers, example, user).then((result) => {
  result.success === true //  true, and `user` should be available on the application state using `actions.getState(['user'])`
})
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an action of type `setState`.
