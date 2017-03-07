const { httpGet } = require('./http')
const { log } = require('./log')
const { writeFile } = require('./file')
const { userInput } = require('./user-input')

module.exports = {
  httpGet,
  log,
  writeFile,
  userInput
}
