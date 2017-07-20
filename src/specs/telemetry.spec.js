const { call } = require('../call')
const { handlers, functions, cmds } = require('./effects')
const { basic } = functions

test('telemetry', async () => {
  let telemetry
  const onCommandComplete = t => {
    telemetry = t
  }
  const config = { onCommandComplete, name: 'telemetry' }
  await call(config, handlers, basic, 'foo')
  const expected = {
    success: true,
    command: cmds.echo('foo'),
    // latency: end - start,
    // start,
    // end,
    index: 0,
    step: 0,
    result: 'foo',
    config
  }
  expect(telemetry).toEqual(expected)
})
