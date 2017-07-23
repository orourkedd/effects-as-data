const { promisify } = require('util')
const fs = require('fs')
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const { call } = require('../index')

function readFileHandler({ path, options }) {
  return readFileAsync(path, options)
}

function readFileCmd(path, options) {
  return {
    type: 'readFile',
    path,
    options
  }
}

function writeFileHandler({ path, content, options }) {
  return writeFileAsync(path, content, options)
}

function writeFileCmd(path, content, options) {
  return {
    type: 'writeFile',
    path,
    content,
    options
  }
}

function nowHandler() {
  return Date.now()
}

function nowCmd() {
  return {
    type: 'now'
  }
}

const iterations = 1000 * 10

async function testStandard() {
  const filePath = '/tmp/perf.txt'
  fs.writeFileSync(filePath, 'foobar', { encoding: 'utf8' })

  const start = Date.now()
  for (let i = 0; i < iterations; i++) {
    const now = Date.now()
    await writeFileAsync(filePath, now.toString(), { encoding: 'utf8' })
    await readFileAsync(filePath, { encoding: 'utf8' })
  }
  const end = Date.now()
  return end - start
}

async function testEAD() {
  const filePath = '/tmp/perf.txt'
  fs.writeFileSync(filePath, 'foobar', { encoding: 'utf8' })

  const start = Date.now()
  for (let i = 0; i < iterations; i++) {
    await call(
      {},
      {
        readFile: readFileHandler,
        writeFile: writeFileHandler,
        now: nowHandler
      },
      function*() {
        const now = yield nowCmd()
        yield writeFileCmd(filePath, now.toString(), { encoding: 'utf8' })
        yield readFileCmd(filePath, { encoding: 'utf8' })
      }
    )
  }

  const end = Date.now()
  return end - start
}

async function benchmark() {
  const standard = await testStandard()
  const ead = await testEAD()
  const diff = ead - standard
  const perTransaction = diff / iterations
  const microSecondsPerTransaction = (perTransaction * 1000).toFixed(2)
  console.log(`Differnce for ${iterations} transactions: ${diff}ms`)
  console.log(`Differnce per transaction: ${microSecondsPerTransaction}μs`)
}

benchmark().catch(console.error)
