const { env } = require('./env')
const { requireModule } = require('./require-module')
const { readFile, writeFile } = require('./fs')

module.exports = {
  env,
  requireModule,
  readFile,
  writeFile
}
