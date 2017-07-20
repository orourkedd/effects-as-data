const { call } = require('../index')
const { handlers, functions, cmds } = require('./effects')
const { basicMultistep } = functions
const { delay } = require('./test-util')

test('telemetry', async () => {
  let telemetry = []
  const onCommandComplete = t => {
    telemetry.push(t)
  }
  const config = { onCommandComplete, name: 'telemetry' }
  const now = Date.now()
  await call(config, handlers, basicMultistep, 'foo')
  telemetry.forEach((t, i) => {
    const message = 'foo' + (i + 1)
    expect(t.success).toEqual(true)
    expect(t.command).toEqual(cmds.echo(message))
    expect(t.latency).toBeLessThan(5)
    expect(t.start).toBeGreaterThanOrEqual(now)
    expect(t.end).toBeGreaterThanOrEqual(now)
    expect(t.index).toEqual(0)
    expect(t.step).toEqual(i)
    expect(t.result).toEqual(message)
    expect(t.config).toEqual(config)
  })
})
