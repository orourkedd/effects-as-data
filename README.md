# Effects as Data

## Installation
```sh
npm i --save effects-as-data
```

## Usage
### Action Creators
First, create some action creators:
```js
const httpGet = (url) => {
  return {
    type: 'httpGet',
    url
  }
}
```

### Action Handlers
Second, create handlers for the actions:
```js
const httpGetActionHandler = (action) => {
  return fetch(action.url)
    .then((response) => response.json())
}
```

### Pure Functions for Business Logic
Third, define a pure function that `effects-as-data` can use to perform your business logic:
```js
const { httpGet } = require('./actions')

const getUsers = function * () {
  const users = yield httpGet('/api/v1/users')
  return users
}
```

### Test
Fourth, test your business logic using logic-less tests:
```js
const { getUsers } = require('./users')
const { testIt } = require('effects-as-data/lib/test')

it('should get users', testIt(getUsers, () => {
  return [
    [undefined, httpGet('/api/v1/users')]
  ]
})
```

### Wire It Up
Fifth, wire it all up:
```js
const { httpGetActionHandler } = require('./action-handlers')
const { run } = require('effects-as-data')
const { getUsers } = require('./users')

const handlers = {
  httpGet: httpGetActionHandler
}

run(handlers, getUsers).then((users) => {
  console.log('Users:', users)
})
```
