# Effects-as-data

Effects-as-data is a micro abstraction layer for Javascript that makes writing and testing Javascript easier.  Using effects-as-data dramatically reduces the time it takes to deliver highly tested code.

## Effects-as-data Example

Consider this function that reads a config file based on a base path and `NODE_ENV`:

```js
const { promisify } = require("util");
const fs = require('fs');
const readFile = promisify(fs.readFile)

async function readConfig(basePath) {
  const { NODE_ENV } = process.env
  const config = await readFile(`${basePath}/${NODE_ENV}.json`, { encoding: 'utf8' });
  return JSON.parse(config);
}

module.exports = {
  readConfig
}

```

This is a drop-in replacement written using `effects-as-data`:

```js
const { promisify, call, globalVariable } = require("effects-as-data");
const { readFile } = require('fs');

function* readConfig(basePath) {
  const process = yield globalVariable('process')
  const config = yield call.callback(`${basePath}/${process.env.NODE_ENV}.json`, path, { encoding: 'utf8' });
  return JSON.parse(config);
}

module.exports = {
  readConfig: promisify(readConfig)
}
```
What normally requires mocks, spies, and other tricks for unit testing, `effects-as-data` does simply and declaratively.  The test below tests a complete code path through the function, tests the order in which side-effects occur and tests that everything is called the expected number of times and with the expected arguments:

```js
const { testFn, args } = require('effects-as-data/test');
const { globalVariable, call } = require('effects-as-data');

const testReadConfig = testFn(readConfig);

test("readConfig()", testReadConfig(() => {
  const basePath = '/foo'
  const testProcess = { env: { NODE_ENV: 'development' } }
  return args(basePath)
    .yieldCmd(globalVariable('process'))
      .yieldReturns(testProcess)
    .yieldCmd(call.callback(readFile, `${basePath}/development.json`, { encoding: 'utf8' }))
      .yieldReturns(`{"foo": "bar"}`)
    .returns({ foo: 'bar' })
}))
```

## Why Generators?  Why not async/await?
Generators are much more powerful than `async/await` because generators allow developers to handle Javascript's most difficult problems all in one construct: asynchronous operations, non-determinism (ex: `Date.now()`), and  eliminate in most code the use of globals, singletons, closures for state, dependency injection, brittle promise chains, and mocks/spies.  Generators, when used in `effects-as-data`, allow developers to eliminate the anti-patterns that make Javascript hard to write, maintain and test.
