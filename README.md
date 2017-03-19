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

## Example
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

You can find this in [`demo-cli/functions/save-repositories.js`](https://github.com/orourkedd/effects-as-data/blob/master/src/demo-cli/functions/save-repositories.js)

```js
const { prompt, httpGet, logInfo } = require('../../node').actions
const { isFailure } = require('../../util')
const { pluck } = require('ramda')
const getListOfNames = pluck(['name'])

const saveRepositories = function * (filename) {
  const {payload: username} = yield prompt('\nEnter a github username: ')
  const repos = yield httpGet(`https://api.github.com/users/${username}/repos`)
  if (isFailure(repos)) return repos
  const names = getListOfNames(repos.payload)
  yield logInfo(names.join('\n'))
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
const { runNode } = require('effects-as-data/node')
const { saveRepositories } = require('./functions/save-repositories')

runNode(saveRepositories, 'repos.json').catch(console.error)

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
