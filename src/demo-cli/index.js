require('babel-polyfill')
const { run, handlers } = require('../node')
const { saveRepositories } = require('./functions/save-repositories')

const outputFile = 'repos.json'

//  Clear terminal
console.log('\x1Bc')

run(handlers, saveRepositories, outputFile).catch(console.error)
