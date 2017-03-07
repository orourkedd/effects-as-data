require('babel-polyfill')
const { run } = require('../index')
const handlers = require('./handlers')
const { saveRepositories } = require('./functions/save-repositories')

const outputFile = 'repos.json'

run(handlers, saveRepositories, outputFile).catch(console.error)
