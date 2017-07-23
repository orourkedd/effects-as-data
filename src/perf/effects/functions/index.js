const cmds = require('../cmds')

function* eadBenchmark(filePath) {
  const now = yield cmds.now()
  yield cmds.writeFile(filePath, now.toString(), { encoding: 'utf8' })
  yield cmds.readFile(filePath, { encoding: 'utf8' })
}

module.exports = {
  eadBenchmark
}
