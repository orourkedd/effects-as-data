const { call } = require('../index')
const { handlers, functions, cmds } = require('./effects')
const { basicMultistep, badHandler } = functions
const { sleep } = require('./test-util')

test('telemetry', async () => {
  let telemetry = []
  const onCommandComplete = t => {
    telemetry.push(t)
  }
  const config = { onCommandComplete, name: 'telemetry' }
  const now = Date.now()
  await call(config, handlers, basicMultistep, 'foo')
  expect(telemetry.length).toEqual(2)
  telemetry.forEach((t, i) => {
    const message = 'foo' + (i + 1)
    expect(t.success).toEqual(true)
    expect(t.command).toEqual(cmds.echo(message))
    expect(t.latency).toBeLessThan(5)
    expect(t.start).toBeGreaterThanOrEqual(now)
    expect(t.end).toBeGreaterThanOrEqual(t.start)
    expect(t.index).toEqual(0)
    expect(t.step).toEqual(i)
    expect(t.result).toEqual(message)
    expect(t.config).toEqual(config)
  })
})

test('telemetry on error', async () => {
  let telemetry
  const onCommandComplete = t => {
    telemetry = t
  }
  const config = { onCommandComplete, name: 'telemetry' }
  const now = Date.now()
  const message = 'oops'
  try {
    await call(config, handlers, badHandler, message)
  } catch (e) {}
  await sleep(10)
  expect(telemetry.success).toEqual(false)
  expect(telemetry.command).toEqual(cmds.die(message))
  expect(telemetry.latency).toBeLessThan(5)
  expect(telemetry.start).toBeGreaterThanOrEqual(now)
  expect(telemetry.end).toBeGreaterThanOrEqual(telemetry.start)
  expect(telemetry.index).toEqual(0)
  expect(telemetry.step).toEqual(0)
  expect(telemetry.result.message).toEqual('oops')
  expect(telemetry.config).toEqual(config)
})
