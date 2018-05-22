## Effects-as-data

`effects-as-data` is an implementation of the effects-as-data pattern in Javascript. `effects-as-data` allows you to declaratively test your code and to write code that is easy to maintain as your application grows in complexity. `effects-as-data` will work anywhere that Javascript runs and is seamlessly interoperable with any codebase that uses promises.

See Richard Feldman's presentation on the effects-as-data pattern: [Effects as Data | Reactive 2015 - YouTube](https://www.youtube.com/watch?v=6EdXaWfoslc)

## Getting Started

`effects.js` - Define your application's side effect functions. This allows us to express side effects declaratively in business logic.

```js
const { effect } = require("effects-as-data");
const axios = require("axios");

const get = effect(axios.get, url => assert(url, "url is required"));

module.exports = {
  get
};
```

`users.js` - Use your side effect functions in business logic:

```js
const { get } = require("./effects");

function* getRandomUsers(count = 5) {
  const response = yield get(`https://randomuser.me/api/?results=${count}`);
  return response.data.results;
}

module.exports = {
  getRandomUsers
};
```

`users.spec.js` - Declaratively test your business logic:

```js
const { testFn, args } = require("effects-as-data/test");
const { get } = require("./effects");
const { getRandomUsers } = require("./users");

const testGetRandomUsers = testFn(getRandomUsers);

test(
  "getRandomUsers() should return a list of random users",
  testGetRandomUsers(() => {
    const response = {
      results: [
        {
          gender: "male",
          name: {
            title: "mr",
            first: "romain",
            last: "hoogmoed"
          }
        }
      ]
    };
    return args(1)
      .cmd(get("https://randomuser.me/api/?results=1"))
      .result(response)
      .returns(response.data.results);
  })
);
```

Use your business logic:

```js
const { getRandomUsers } = require("./users");
const { call } = require("effects-as-data");

// use call for application entry points
call(getRandomUsers, 10)
  .then(console.log) // should log random users
  .catch(console.error);
```

## Why Generators? Why not async/await?

Generators are much more powerful than `async/await` because generators allow developers to handle Javascript's most difficult problems all in one construct: asynchronous operations, non-determinism (ex: `Date.now()`), and eliminate in most code the use of globals, singletons, closures for state, dependency injection, brittle promise chains, and mocks/spies. Generators, when used in `effects-as-data`, allow developers to eliminate the anti-patterns that make Javascript hard to write, maintain and test.

## Commands and Interpreters

Commands and interpreters are key concepts in `effects-as-data`. In the example above, a `get` function was defined:

```js
const get = effect(axios.get, url => assert(url, "url is required"));
```

`effect` is a helper function that creates a _command_. In this case, it's a command that tells `effects-as-data` to execute a function (`axios.get`). The `get` function itself is a pure function that returns this payload:

```js
  {
    type: "callFn",
    fn: axios.get,
    args: [...] // the arguments passed to get
  }
```

Notice that this function returns data which describes a side effect, it does not perform the side effect (i.e. it does not do a get request). The _effect_ is declared _as data_.

In `effects-as-data` all side effects are defined declaratively using plain JSON. These definitions are called commands. So where do side effects actually happen? Side effects are performed by command _interpreters_. Look at this example of a custom command and interpreter pair:

```js
const { addInterpreters, call } = require("effects-as-data");
const fs = require("fs");

const interpreters = {
  writeFile: ({ path, content }) =>
    fs.writeFileSync(path, content, { encoding: "utf8" })
};

// Add the interpreters to the effects-as-data runtime
addInterpreters(addInterpreters);

const writeFile = (path, content) => ({
  type: "writeFile",
  path,
  content
});

// Business logic
function* getFileContent(path, content) {
  return yield writeFile(path, content);
}

call(getTimestamp).then(console.log); // a current timestamp will be logged
```

In the above example, a custom `writeFile` command and interpreter were created, effectively decoupling the business logic from the hard-to-test, side effect producing function `fs.writeFileSync`.

Writing code like this has the following benefits:

1.  It can be unit tested declaratively without mocks or spies using the built in effects-as-data testing library.
2.  The implementation of the `writeFile` interpreter can be replaced without changing the business logic (`getFileContent`) or its tests.
3.  The `writeFile` command can be serialized and executed somewhere else, for example, in another process if the interpreter has this capability.
4.  This implementation is consistent. ALL side effects are performed and tested like `writeFile`.
5.  Errors that occur in the interpreter are reported by `effects-as-data` to an `onError` callback, exposing a central place for logging all errors.

## Core commands and interpreters

`effects-as-data` has a selection of built-in commands and interpreters so you can be productive right away.
