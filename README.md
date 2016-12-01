# Effects as Data

## Installation
```sh
npm i --save effects-as-data
```

### Try It
You can run the code below using this command.  You can see the code [here](https://github.com/orourkedd/effects-as-data/blob/master/src/demo/repos.js).
```sh
npm install
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

const log = (message) => {
  return {
    type: 'log',
    message
  }
}

const writeFile = (path, data) => {
  return {
    type: 'writeFile',
    path,
    data
  }
}

const userInput = (question) => {
  return {
    type: 'userInput',
    question
  }
}
```

### Action Handlers
Second, create handlers for the actions.  This is the only place where side-effect producing code should exist.
```js
const httpGetActionHandler = (action) => {
  return get(action.url)
}

const writeFileActionHandler = (action) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(action.path, action.data, {encoding: 'utf8'}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          realpath: path.resolve(action.path),
          path: action.path
        })
      }
    })
  })
}

const logHandler = (action) => {
  console.log(action.message)
}

const userInputHandler = (action) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(action.question, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}
```

### Pure Functions for Business Logic
Third, define a pure function that `effects-as-data` can use to perform your business logic.  This function coordinates your workflow.  The function below does a lot and would normally be difficult to test:
* Reads user input (a Github username).
* Does a GET request to Github for the user's repositories.
* Prints the user's repositories in a formatted list
* Writes the user's repositories to a file.

```js
const saveRepositories = function * (filename) {
  const {payload: username} = yield userInput('\nEnter a github username: ')
  const repos = yield httpGet(`https://api.github.com/users/${username}/repos`)
  if (isFailure(repos)) return repos
  const list = buildList(repos.payload)
  yield printRepository(list, username)
  const writeResult = yield writeFile(filename, JSON.stringify(repos.payload))
  if (isFailure(writeResult)) return writeResult
  yield log(`\nRepos Written From Github To File: ${writeResult.payload.realpath}`)
  return writeResult
}

const printRepository = (list, username) => {
  return [
    log(`\nRepositories for ${username}`),
    log(`=============================================`),
    log(list)
  ]
}

const buildList = (repos) => {
  const l1 = map(pick(['name', 'git_url']), repos)
  const l2 = map(({name, git_url}) => `${name}: ${git_url}`, l1)
  const l3 = l2.join('\n')
  return l3
}
```

### Test It
Fourth, test your business logic using logic-less tests.  Each tuple in the array is an input-output pair.
```js
it('should get user repos and write file', testIt(saveRepositories, () => {
  const repos = [{name: 'test', git_url: 'git://...'}]
  const reposListFormatted = 'test: git://...'
  const writeFileResult = success({path: 'repos.json', realpath: 'r/repos.json'})
  //  3 log actions return 3 success results
  const printResult = [success(), success(), success()]
  return [
    ['repos.json', userInput('\nEnter a github username: ')],
    ['orourkedd', httpGet('https://api.github.com/users/orourkedd/repos')],
    [repos, printRepository(reposListFormatted, 'orourkedd')],
    [printResult, writeFile('repos.json', JSON.stringify(repos))],
    [writeFileResult, log('\nRepos Written From Github To File: r/repos.json')],
    [undefined, writeFileResult]
  ]
}))

it('should log http error and return failure', testIt(saveRepositories, () => {
  const httpError = new Error('http error!')
  return [
    ['repos.json', userInput('\nEnter a github username: ')],
    ['orourkedd', httpGet('https://api.github.com/users/orourkedd/repos')],
    [failure(httpError), failure(httpError)]
  ]
}))

it('should log file write error and return failure', testIt(saveRepositories, () => {
  const repos = [{name: 'test', git_url: 'git://...'}]
  const reposListFormatted = 'test: git://...'
  const writeError = new Error('write error!')
  //  3 log actions return 3 success results
  const printResult = [success(), success(), success()]
  return [
    ['repos.json', userInput('\nEnter a github username: ')],
    ['orourkedd', httpGet('https://api.github.com/users/orourkedd/repos')],
    [repos, printRepository(reposListFormatted, 'orourkedd')],
    [printResult, writeFile('repos.json', JSON.stringify(repos))],
    [failure(writeError), failure(writeError)]
  ]
}))
```

### Debug
If your tests are failing, you get a message like this:

```
AssertionError: expected { Object (type, path, ...) } to deeply equal { Object (type, path, ...) }

Error on step 4
============================

Expected:
{
  "type": "writeFile",
  "path": "wrong-file.json",
  "data": ...
}

Actual:
{
  "type": "writeFile",
  "path": "repos.json",
  "data": ...
}
```

### Wire It Up and Run It
Fifth, wire it all up:
```js
const handlers = {
  httpGet: httpGetActionHandler,
  writeFile: writeFileActionHandler,
  log: logHandler,
  userInput: userInputHandler
}

run(handlers, saveRepositories, 'repos.json').catch(console.error)
```
