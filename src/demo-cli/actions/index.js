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

module.exports = {
  httpGet,
  log,
  writeFile,
  userInput
}
