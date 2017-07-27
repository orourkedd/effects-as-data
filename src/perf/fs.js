const { call } = require('../index')
const handlers = require('./effects/handlers')
const { eadBenchmark } = require('./effects/functions')
const { standardBenchmark } = require('./standard')

const iterations = 1000 * 50

const filePath = '/tmp/perf.txt'

async function testStandard() {
  const start = Date.now()
  for (let i = 0; i < iterations; i++) {
    await standardBenchmark(filePath)
  }
  const end = Date.now()
  return end - start
}

async function testEAD() {
  const start = Date.now()
  for (let i = 0; i < iterations; i++) {
    await call({}, handlers, eadBenchmark, filePath)
  }
  const end = Date.now()
  return end - start
}

async function benchmark() {
  console.log(`Wait while operation runs ${iterations} times...`)
  const standard = await testStandard()
  const ead = await testEAD()
  const diff = ead - standard
  const perTransaction = diff / iterations
  const microSecondsPerTransaction = (perTransaction * 1000).toFixed(2)
  console.log(`Differnce for ${iterations} transactions: ${diff}ms`)
  console.log(`Differnce per transaction: ${microSecondsPerTransaction}μs`)
}

benchmark().catch(console.error)
