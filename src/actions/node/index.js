const { merge } = require('ramda')
const { env } = require('./env')
const { requireModule } = require('./require-module')
const { readFile, writeFile } = require('./fs')
const universal = require('../universal')

module.exports = merge(universal, {
  env,
  requireModule,
  readFile,
  writeFile
})
