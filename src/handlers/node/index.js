const { merge } = require('ramda')
const { env } = require('./env')
const { requireModule } = require('./require-module')
const { node } = require('./node')
const universal = require('../universal')

module.exports = merge(universal, {
  env,
  requireModule,
  node
})
