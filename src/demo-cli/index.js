require('babel-polyfill')
const { runNode } = require('../node')
const { saveRepositories } = require('./functions/save-repositories')

const outputFile = 'repos.json'

//  Clear terminal
console.log('\x1Bc')

runNode(saveRepositories, outputFile).catch(console.error)
