# Effects as Data

## Installation
```sh
npm i --save effects-as-data
```

### Try It
You can run the code below using:
```sh
npm run demo
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

const writeFile = (path, data) => {
  return {
    type: 'writeFile',
    path,
    data
  }
}
```

### Action Handlers
Second, create handlers for the actions:
```js
const fetch = require('isomorphic-fetch')
const { writeFile } = require('fs')

const httpGetActionHandler = (action) => {
  return fetch(action.url)
    .then((response) => response.json())
}

const writeFileActionHandler = (action) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(action.path, action.data, {encoding: 'utf8'}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
```

### Pure Functions for Business Logic
Third, define a pure function that `effects-as-data` can use to perform your business logic:
```js
const { httpGet, writeFile } = require('./actions')

const saveRepositories = function * () {
  const repos = yield httpGet('https://api.github.com/repositories')
  const result = yield writeFile('repos.json', JSON.stringify(repos))
  return result
}
```

### Test It
Fourth, test your business logic using logic-less tests:
```js
const { saveRepositories } = require('./users')
const { httpGet } = require('./actions')
const { testIt } = require('effects-as-data/lib/test')

it('should get users', testIt(saveRepositories, () => {
  const repos = [{id: 1}]
  return [
    [undefined, httpGet('/api/v1/users')],
    [repos, writeFile('repos.json', JSON.stringify(repos))]
  ]
})
```

### Wire It Up and Run It
Fifth, wire it all up:
```js
const { httpGetActionHandler, writeFileActionHandler } = require('./action-handlers')
const { run } = require('effects-as-data')
const { saveRepositories } = require('./users')
const { readFileSync } = require('fs')

const handlers = {
  httpGet: httpGetActionHandler,
  writeFile: writeFileActionHandler
}

run(handlers, saveRepositories).then(() => {
  console.log('Repos Written To Disk')
  const contents = readFileSync('repos.json', {encoding: 'utf8'})
  const json = JSON.parse(contents)
  console.log(JSON.stringify(json, true, 2))
})
```
