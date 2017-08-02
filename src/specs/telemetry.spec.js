const { call } = require('../index')
const { handlers, functions, cmds } = require('./effects')
const { basicMultistep, badHandler, basic } = functions
const { sleep } = require('./test-util')

test('telemetry - onCommandCall', async () => {
  let telemetry
  const onCommandCall = t => {
    telemetry = t
  }
  const config = { onCommandCall, name: 'telemetry' }
  await call(config, handlers, basicMultistep, 'foo')
  expect(telemetry.length).toEqual(2)
  telemetry.forEach((t, i) => {
    const message = 'foo' + (i + 1)
    expect(t.args).toEqual([message])
    expect(t.command).toEqual(cmds.echo(message))
    expect(t.index).toEqual(0)
    expect(t.step).toEqual(i)
    expect(t.config).toEqual(config)
  })
})

test('telemetry - onCommandComplete', async () => {
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

test('telemetry on error - onCommandComplete', async () => {
  let telemetry
  const onCommandComplete = t => {
    telemetry = t
  }
  const config = { onCommandComplete }
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

test('onCall', async () => {
  let called
  const onCall = t => {
    called = t
  }
  const config = { onCall }
  await call(config, handlers, basicMultistep, 'foo', 'bar', 'baz')
  expect(called.args).toEqual(['foo', 'bar', 'baz'])
})

test('onComplete', async () => {
  let complete
  const onComplete = t => {
    complete = t
  }
  const config = { onComplete, name: 'telemetry' }
  await call(config, handlers, basic, 'foo')
  expect(complete.result).toEqual('foo')
})
