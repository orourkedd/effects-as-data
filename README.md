# Effects-as-data

Effects-as-data is a micro abstraction layer for Javascript that makes writing and testing Javascript easier.  Using effects-as-data dramatically reduces the time it takes to deliver highly tested code.

## Effects-as-data Example

Consider this function that reads a config file based on a base path and `NODE_ENV`.  This simple function is hard to unit test and will probably take you a long time.  It would require mocking `process.env.NODE_ENV`, mocking/injecting `readFile`, mocking `logger.error`, and somehow forcing an error to test the error handling logic.

```js
const { promisify } = require("util");
const fs = require('fs');
const readFile = promisify(fs.readFile)
const logger = require('logger')

async function readConfig(basePath) {
  const { NODE_ENV } = process.env
  const path = `${basePath}/${NODE_ENV}.json`;
  const config = await readFile(path, { encoding: 'utf8' });
  try {
    return JSON.parse(config);
  } catch (e) {
    logger.error(e);
    return {
      default: 'config'
    }
  }
}

module.exports = {
  readConfig
}

```

This is a drop-in replacement written using `effects-as-data`:

```js
const { globalVariable, call, fn, jsonParse, either, promisify } = require("effects-as-data");
const { readFile } = require('fs');

function* readConfig(basePath) {
  const { env } = yield globalVariable('process');
  const path = `${basePath}/${env.NODE_ENV}.json`;
  const config = yield call.callback(readFile, path, { encoding: 'utf8' });
  const parse = call.fn(JSON.parse, config);
  return yield either(parse, { default: 'config' });
}

module.exports = {
  readConfig: promisify(readConfig)
}
```
What normally requires mocks, spies, and other tricks for unit testing, `effects-as-data` does simply and declaratively.  The tests below tests all code branches in the function, tests the order in which side-effects occur and tests that everything is called the expected number of times and with the expected arguments:

```js
const { testFn, args } = require('effects-as-data/test');
const { globalVariable, call, jsonParse } = require('effects-as-data');

const testReadConfig = testFn(readConfig);

test("readConfig() should return parsed config", testReadConfig(() => {
  const basePath = '/foo'
  const testProcess = { env: { NODE_ENV: 'development' } }
  return args(basePath)
    .cmd(globalVariable('process'))
      .result(testProcess)
    .cmd(callback(readFile, `${basePath}/development.json`, { encoding: 'utf8' }))
      .result(`{"foo": "bar"}`)
    .cmd(either(jsonParse(config), { default: 'config' }))
      .result({ foo: 'bar' })
    .returns({ foo: 'bar' })
}))
```

## Why Generators?  Why not async/await?
Generators are much more powerful than `async/await` because generators allow developers to handle Javascript's most difficult problems all in one construct: asynchronous operations, non-determinism (ex: `Date.now()`), and  eliminate in most code the use of globals, singletons, closures for state, dependency injection, brittle promise chains, and mocks/spies.  Generators, when used in `effects-as-data`, allow developers to eliminate the anti-patterns that make Javascript hard to write, maintain and test.
