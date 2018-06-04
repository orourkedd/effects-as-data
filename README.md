## Effects-as-data

`effects-as-data` is an implementation of the effects-as-data pattern in Javascript. `effects-as-data` allows you to declaratively test your code and to write code that is easy to maintain as your application grows in complexity. `effects-as-data` will work anywhere that Javascript runs and is seamlessly interoperable with any codebase that uses promises.

See Richard Feldman's presentation on the effects-as-data pattern: [Effects as Data | Reactive 2015 - YouTube](https://www.youtube.com/watch?v=6EdXaWfoslc)

## Getting Started

`effects.js` - Define your application's side effect functions. This allows us to express side effects declaratively in business logic.

```js
const { effect } = require("effects-as-data");
const axios = require("axios");

const get = effect(axios.get);

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
      .cmd(get("https://randomuser.me/api/?results=1")) // yield cmd
      .result(response) // const result = yield ...
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

Generators are much more powerful than `async/await` because generators allow developers to handle Javascript's most difficult problems with one construct: asynchrony and non-determinism. Effects-as-data eliminates the use of globals, singletons, closures for state, dependency injection, brittle promise chains, and mocks/spies. Generators make this possible because of the ability to "pause" function execution, give control to the `effects-as-data` runtime which takes care of the side effects that you describe with commands, and then resume function execution with the result of the command.

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

### call

`call` is used to call another `effects-as-data` function:

```js
const { cmds, call } = require("effects-as-data");

function* a(message) {
  return yield cmds.echo(message);
}

function* b() {
  return yield cmds.call(a, "hi");
}

call(b).then(console.log); // "hi"
```

### call.fn

`call.fn` is used to call non-`effects-as-data` functions. If the function returns a promise, `effects-as-data` will resolve it:

```js
const { cmds, call } = require("effects-as-data");

function a(message) {
  return Promise.resolve(message);
}

function* b() {
  return yield cmds.call.fn(a, "hi");
}

call(b).then(console.log); // "hi"
```

### callFnBound

`callFnBound` is used to call a non-`effects-as-data` function with `this`:

```js
const { cmds, call } = require("effects-as-data");

const obj = {
  message: "hi",
  a() {
    return this.message;
  }
};

function* b() {
  return yield cmds.callFnBound(obj, obj.a);
}

call(b).then(console.log); // "hi"
```

### callback

`callback` is used to call a non-`effects-as-data` function that accepts a callback:

```js
const { cmds, call } = require("effects-as-data");
const fs = require("fs");

function* b() {
  return yield cmds.callback(fs.readFile, "/path/file.txt", { encoding "utf8" });
}

call(b).then(console.log); // contents of "/path/file.txt"
```

### callCallbackBound

`callCallbackBound` is used to call a non-`effects-as-data` function that accepts a callback with `this`:

```js
const { cmds, call } = require("effects-as-data");

const obj = {
  message: "hi",
  a(done) {
    done(this.message);
  }
};

function* b() {
  return yield cmds.callCallbackBound(obj, obj.a);
}

call(b).then(console.log); // "hi"
```

### echo

`echo` is used simple to echo back a value:

```js
const { cmds, call } = require("effects-as-data");

function* a(message) {
  return yield cmds.echo(message);
}

call(a, "hi").then(console.log); // "hi"
```

### noop

`noop` is used simple to do nothing:

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  return yield cmds.noop();
}

call(a).then(console.log); // returns undefined
```

### now

`now` returns the current timestamp:

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  return yield cmds.now();
}

call(a).then(console.log); // result of Date.now()
```

### globalVariable

`globalVariable` is used to get a global variable. This means that you have access to globals without the pain of globals.

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  return yield cmds.globalVariable("process");
}

call(a).then(console.log); // returns global.process or window.process
```

### log

`log` is a pass-through to `console.log`

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  return yield cmds.log("hi");
}

call(a); // prints "hi"
```

### logError

`logError` is a pass-through to `console.error`

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  return yield cmds.logError("oops");
}

call(a); // prints "oops" using console.error
```

### setImmediate

`setImmediate` is used to execute a command. It behaves like node's `setImmediate`;

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  const logCmd = cmds.log("hi");
  yield cmds.setImmediate(logCmd);
  return "ok";
}

call(a); // function will return before "hi" get's logged
```

Unlike, node's `setImmediate`, however, `effects-as-data` will maintain an execution context and you'll know its `effects-as-data` stack trace. If you want to intentionally prevent it from tracking the stack trace, pass `true` as the second argument to the `setImmediate` command:

```js
cmds.setImmediate(logCmd, true);
```

### setTimeout

`setTimeout` is used to execute a command after a timeout. It behaves like node's `setTimeout`;

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  const logCmd = cmds.log("hi");
  yield cmds.setTimeout(logCmd, 1000);
  return "ok";
}

call(a); // "hi" is printed ~1 second after the function returns
```

Unlike, node's `setTimeout`, however, `effects-as-data` will maintain an execution context and you'll know its `effects-as-data` stack trace. If you want to intentionally prevent it from tracking the stack trace, pass `true` as the third argument to the `setTimeout` command:

```js
cmds.setTimeout(logCmd, 1000, true);
```

### clearTimeout

`clearTimeout` will clear a timeout:

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  yield cmds.clearTimeout(SOME_TIMEOUT_ID);
}

call(a); // timeout SOME_TIMEOUT_ID should be cleared
```

### setInterval

`setInterval` is used to execute a command after on an interval. It behaves like node's `setInterval`;

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  const logCmd = cmds.log("hi");
  yield cmds.setInterval(logCmd, 1000);
}

call(a); // "hi" will be printed every second
```

Unlike, node's `setInterval`, however, `effects-as-data` will maintain an execution context and you'll know its `effects-as-data` stack trace. If you want to intentionally prevent it from tracking the stack trace, pass `true` as the third argument to the `setInterval` command:

```js
cmds.setInterval(logCmd, 1000, true);
```

### clearInterval

`clearInterval` will clear an interval:

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  yield cmds.clearInterval(SOME_INTERVAL_ID);
}

call(a); // interval SOME_INTERVAL_ID should be cleared
```

### sleep

`sleep` will cause the function to sleep, similar to linux's sleep. `sleep` accepts milliseconds.

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  yield cmds.sleep(1000);
  yield cmds.log("This is printed after 1 second");
  yield cmds.sleep(1000);
  yield cmds.log("This is printed after another second");
}

call(a);
```

### series

`series` will execute commands in a series, on after another. If a commands fails, it will throw an error.

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  const [one, two] = yield cmds.series([
    cmds.echo("1")
    cmds.echo("2")
  ]);

  return { one, two }
}

call(a); // returns { one: 1, two: 2 }
```

### parallel

`parallel` will execute commands in parallel. If a commands fails, it will throw an error.

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  const [one, two] = yield cmds.parallel([cmds.echo("1"), cmds.echo("2")]);
  return { one, two };
}

call(a); // returns { one: 1, two: 2 }
```

Note: `cmds.parallel` is really a pass-through to `effects-as-data`'s built-in support for parallelism:

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  const [one, two] = yield [cmds.echo("1"), cmds.echo("2")];
  return { one, two };
}

call(a); // returns { one: 1, two: 2 }
```

### envelope

`envelope` is used when you expect an error but don't want to `try/catch`. Many times, this makes testing easier.

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  const cmd = cmds.call(unreliableFunction);
  const payload = yield cmds.envelope(cmd);

  if (payload.success === true) {
    return payload.result;
  } else {
    // do some error handling
    yield cmds.customErrorReporter(payload.result);
    return "defaultvalue";
  }
}

call(a); // returns { one: 1, two: 2 }
```

### either

`either` is used when you except a possible falsey return value but don't want to introduce branching into your code. If the command returns a falsey value, the `either` will return the default value:

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  const findUserCmd = cmds.call(findUserById, "123");
  const user = cmds.either(findUserCmd, { id: "defaultuser" });
  return user;
}

call(a); // returns { one: 1, two: 2 }
```

### getState/setState

`getState` and `setState` are used when you need to save some data in memory, but don't want to use closures. The `getState` and `setState` interpreters can be swapped out and this code will also work with another data store (i.e. `redis`, `etcd`, etc) without being changed.

```js
const { cmds, call } = require("effects-as-data");

function* increment() {
  const value = yield cmds.getState("value", 0); // 0 is the default value
  const newValue = value + 1;
  yield cmds.setState("value", newValue);
  return newValue;
}

call(increment); // returns 1
call(increment); // returns 2
call(increment); // returns 3
```

### clearState

`clearState` is used to delete a value set using `setState`:

```js
const { cmds, call } = require("effects-as-data");

function* a() {
  yield cmds.setState("value", 1);
  const v1 = cmds.getState("value"); // v1 === 1
  yield cmds.clearState("value");
  const v2 = cmds.getState("value"); // v2 === undefined
}

call(a);
```

## Creating custom commands and interpreters

Creating your own commands and interpreters is a power way to abstract out of your business logic implementation details related to hard-to-test code. For example, code that uses `setTimeout` is normally a pain to test. With `effects-as-data`, `setTimeout` has been extracted out to its own command, making it used in business logic declarative and, therefore, easy to test.

Note: custom commands and interpreters are no different than core commands and interpreters. You can also replace any interpreter to change how a command is processed, without touching business logic!

### Commands

Commands are descriptions of what you want done. `effects-as-data` will route commands to interpreters based on the `type` field. The command below will be routed to an interpreter with the same `doSomething`. For convenience, a function called `doSomething` is created to create this command. Validation can also be added to the function:

```js
function doSomething(value) {
  assert(value, "value required");
  return {
    type: "doSomething",
    value
  };
}
```

### Interpreters

Interpreters _interpret_ the commands. One great use of commands is to keep hard-to-test code from touching your easy-to-test `effects-as-data` business logic:

```js
function doSomething(cmd) {
  return terribleHardToTestLibrary.doSomeOperation(cmd.value);
}
```

### Using custom commands and interpreters

```js
const { call, addInterpreters } = require("effects-as-data");
const { doSomething } = require("./cmds");
const interpreters = require("./interpreters"); // the doSomething interpreter is here

// custom interpreters have to be added to the effects-as-data runtime
addInterpreters(interpreters);

function* myBusinessLogic(value) {
  return yield doSomething(value);
}

call(myBusinessLogic, "foo"); // a promise will be returned with the result of terribleHardToTestLibrary.doSomeOperation("foo")
```
