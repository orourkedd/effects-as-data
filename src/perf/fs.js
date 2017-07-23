const { promisify } = require('util')
const fs = require('fs')
const readFileAsync = promisify(fs.readFile)
const { call } = require('../index')

function readFileHandler({ path }) {
  return readFileAsync(path)
}

function readFileCmd(path) {
  return {
    type: 'readFile',
    path
  }
}

const iterations = 1000 * 20

async function testStandard() {
  const filePath = '/tmp/perf.txt'
  fs.writeFileSync(filePath, 'foobar', { encoding: 'utf8' })

  console.time('standard')
  for (let i = 0; i < iterations; i++) {
    await readFileAsync(filePath, { encoding: 'utf8' })
    await readFileAsync(filePath, { encoding: 'utf8' })
  }

  console.timeEnd('standard')
}

async function testEAD() {
  const filePath = '/tmp/perf.txt'
  fs.writeFileSync(filePath, 'foobar', { encoding: 'utf8' })

  console.time('ead')
  for (let i = 0; i < iterations; i++) {
    await call({}, { readFile: readFileHandler }, function*() {
      yield readFileCmd(filePath)
      yield readFileCmd(filePath)
    })
  }

  console.timeEnd('ead')
}

testStandard().then(testEAD).catch(console.log)
