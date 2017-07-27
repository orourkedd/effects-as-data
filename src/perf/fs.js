const { call } = require('../index')
const handlers = require('./effects/handlers')
const { eadBenchmark } = require('./effects/functions')
const { standardBenchmark } = require('./standard')

const iterations = 1000 * 30
const percentile = 0.99

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

async function test() {
  console.log(`Wait while operation runs ${iterations} times...`)
  const eadLatencies = []
  const standardLatencies = []
  for (let i = 0; i < iterations; i++) {
    if (i % 5000 === 0) console.log(`${i} complete`)
    const startEad = Date.now()
    await call({}, handlers, eadBenchmark, filePath)
    const endEad = Date.now()
    eadLatencies.push(endEad - startEad)
    const startStandard = Date.now()
    await standardBenchmark(filePath)
    const endStandard = Date.now()
    standardLatencies.push(endStandard - startStandard)
  }

  const ead99 = eadLatencies.sort().splice(0, iterations * percentile)
  const standard99 = standardLatencies.sort().splice(0, iterations * percentile)

  const sum = (p, c) => p + c
  const eadTotal = ead99.reduce(sum, 0)
  const standardTotal = standard99.reduce(sum, 0)
  const diff = eadTotal - standardTotal
  const perTransaction = diff / iterations
  const microSecondsPerTransaction = (perTransaction * 1000).toFixed(2)
  const percentSlower = ((1 - standardTotal / eadTotal) * 100).toFixed(2)
  console.log('Effects-as-data total:', eadTotal)
  console.log('Pure Javascript total:', standardTotal)
  console.log(
    `Per transaction, effects-as-data was ${microSecondsPerTransaction}μs slower than pure Javascript.`
  )
  console.log(
    `For ${iterations} transactions, effects-as-data was ${percentSlower}% / ${diff}ms slower than pure Javascript.`
  )
}

test().catch(console.error)
