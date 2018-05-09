## Effects-as-data Example

```js
const { promisify } = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);
const logger = require("logger");

async function getResource(id) {
  const time = Date.now();
  const resource = await http.get(
    `http://example.com/resource/${id}?cache=${time}`
  );
  return getResource;
}

module.exports = {
  getResource
};
```

This is a drop-in replacement written using `effects-as-data`:

```js
const { promisify, cmds } = require("effects-as-data");
const http = require("effects-as-data-http");

function* getResource(id) {
  const time = yield cmds.now();
  const resource = yield http.get(
    `http://example.com/resource/${id}?cache=${time}`
  );
  return getResource;
}

module.exports = {
  getResource: promisify(getResource)
};
```

What normally requires mocks, spies, and other tricks for unit testing, `effects-as-data` does simply and declaratively. The tests below tests all code branches in the function, tests the order in which side-effects occur and tests that everything is called the expected number of times and with the expected arguments:

```js
const { testFn, args } = require("effects-as-data/test");
const { promisify, cmds } = require("effects-as-data");
const http = require("effects-as-data-http");

const testGetResource = testFn(getResource);

test(
  "getResource() should do an http get request and return the resource",
  testGetResource(() => {
    const id = "123";
    const time = 23456;
    const resource = { foo: "bar" };
    return args(id)
      .cmd(cmds.now())
      .result(time)
      .cmd(http.get(`http://example.com/resource/${id}?cache=${time}`))
      .result(resource)
      .returns(resource);
  })
);
```

## Why Generators? Why not async/await?

Generators are much more powerful than `async/await` because generators allow developers to handle Javascript's most difficult problems all in one construct: asynchronous operations, non-determinism (ex: `Date.now()`), and eliminate in most code the use of globals, singletons, closures for state, dependency injection, brittle promise chains, and mocks/spies. Generators, when used in `effects-as-data`, allow developers to eliminate the anti-patterns that make Javascript hard to write, maintain and test.
