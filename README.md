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

const httpPut = (url, payload) => {
  return {
    type: 'httpPut',
    url,
    payload
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

const httpPutActionHandler = (action) => {
  return fetch(action.url, {
    method: 'POST',
    body: action.payload
  })
  .then((response) => response.json())
}
```

### Pure Functions for Business Logic
Third, define a pure function that `effects-as-data` can use to perform your business logic:
```js
const { httpGet, httpPut } = require('./actions')

const updateUsers = function * () {
  const users = yield httpGet('/api/v1/users')
  const updatedUsers = map((user) => {
    return merge(user, {
      fullname: `${user.firstname} ${user.lastname}`
    })
  }, users)
  const result = yield httpPut('/api/v1/users', updatedUsers)
  return result
}
```

### Test
Fourth, test your business logic using logic-less tests:
```js
const { updateUsers } = require('./users')
const { httpGet } = require('./actions')
const { testIt } = require('effects-as-data/lib/test')

it('should get users', testIt(updateUsers, () => {
  const users = [{id: 1, firstname: 'John', lastname: 'Doe'}]
  const updatedUsers = [{id: 1, firstname: 'John', lastname: 'Doe', fullname: 'John Doe'}]
  return [
    [undefined, httpGet('/api/v1/users')],
    [users, httpPut('/api/v1/users', updatedUsers)]
  ]
})
```

### Wire It Up
Fifth, wire it all up:
```js
const { httpGetActionHandler, httpPutActionHandler } = require('./action-handlers')
const { run } = require('effects-as-data')
const { updateUsers } = require('./users')

const handlers = {
  httpGet: httpGetActionHandler,
  httpPut: httpPutActionHandler
}

run(handlers, updateUsers).then((users) => {
  console.log('Users:', users)
})
```
