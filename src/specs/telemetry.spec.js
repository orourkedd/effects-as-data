const { call } = require('../index')
const { handlers, functions, cmds } = require('./effects')
const { basicMultistep, badHandler, basic } = functions
const { sleep } = require('./test-util')

test('telemetry - should add a correlation id to the config', async () => {
  let telemetry
  const onCommand = t => {
    telemetry = t
  }
  const config = { onCommand, name: 'telemetry' }
  const now = Date.now()
  await call(config, handlers, basic, 'foo')
  await sleep(10)
  expect(telemetry.config.cid.length).toEqual(36)
})

test('telemetry - should use an existing correlation id if on the config', async () => {
  let telemetry
  const onCommand = t => {
    telemetry = t
  }
  const config = { onCommand, name: 'telemetry', cid: 'foo' }
  const now = Date.now()
  await call(config, handlers, basic, 'bar')
  await sleep(10)
  expect(telemetry.config.cid).toEqual('foo')
})

test('telemetry - should add a stack to the config and push the current frame', async () => {
  let telemetry
  const onCommand = t => {
    telemetry = t
  }
  const config = { onCommand, name: 'telemetry' }
  const now = Date.now()
  await call(config, handlers, basic, 'foo')
  await sleep(10)
  expect(telemetry.config.stack[0].fn).toEqual(basic)
  expect(telemetry.config.stack[0].handlers).toEqual(handlers)
  expect(telemetry.config.stack[0].args).toEqual(['foo'])
  expect(telemetry.config.stack[0].config.onCommand).toEqual(onCommand)
  expect(telemetry.config.stack[0].config.name).toEqual('telemetry')
  expect(telemetry.config.stack[0].config.cid.length).toEqual(36)
  expect(telemetry.config.stack[0].config.stack[0].handlers).toEqual(handlers)
  expect(telemetry.config.stack[0].config.stack[0].args).toEqual(['foo'])
  expect(telemetry.config.stack[0].config.stack[0].fn).toEqual(basic)
  expect(telemetry.config.stack[0].config.stack[0].config.name).toEqual(
    'telemetry'
  )
})

test('telemetry - should add a stack to the config for child calls', async () => {
  let telemetry
  const onCommand = t => {
    telemetry = t
  }
  const config = { onCommand, name: 'telemetry' }
  const now = Date.now()
  await call(config, handlers, basic, 'foo')
  await sleep(10)
  expect(telemetry.config.stack[0].fn).toEqual(basic)
  expect(telemetry.config.stack[0].handlers).toEqual(handlers)
  expect(telemetry.config.stack[0].args).toEqual(['foo'])
  expect(telemetry.config.stack[0].config.onCommand).toEqual(onCommand)
  expect(telemetry.config.stack[0].config.name).toEqual('telemetry')
  expect(telemetry.config.stack[0].config.cid.length).toEqual(36)
  expect(telemetry.config.stack[0].config.stack[0].handlers).toEqual(handlers)
  expect(telemetry.config.stack[0].config.stack[0].args).toEqual(['foo'])
  expect(telemetry.config.stack[0].config.stack[0].fn).toEqual(basic)
  expect(telemetry.config.stack[0].config.stack[0].config.name).toEqual(
    'telemetry'
  )
})

test('telemetry - onCommand', async () => {
  let telemetry = []
  const onCommand = t => {
    telemetry.push(t)
  }
  const config = { onCommand, name: 'telemetry' }
  const now = Date.now()
  await call(config, handlers, basicMultistep, 'foo')
  await sleep(10)
  expect(telemetry.length).toEqual(2)
  telemetry.forEach((t, i) => {
    const message = 'foo' + (i + 1)
    expect(t.command).toEqual(cmds.echo(message))
    expect(t.fn).toEqual(basicMultistep)
    expect(t.start).toBeGreaterThanOrEqual(now)
    expect(t.index).toEqual(0)
    expect(t.step).toEqual(i)
    expect(t.config.name).toEqual('telemetry')
    expect(t.config.stack[0].fn).toEqual(basicMultistep)
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
  await sleep(10)
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
    expect(t.config.name).toEqual('telemetry')
    expect(t.config.stack[0].fn).toEqual(basicMultistep)
    expect(t.fn).toEqual(basicMultistep)
  })
})

test('telemetry on error - onCommandComplete', async () => {
  let telemetry
  const onCommandComplete = t => {
    telemetry = t
  }
  const config = { onCommandComplete, name: 'badHandler' }
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
  expect(telemetry.config.name).toEqual('badHandler')
  expect(telemetry.config.stack[0].fn).toEqual(badHandler)
  expect(telemetry.fn).toEqual(badHandler)
})

test('onCall', done => {
  const onCall = called => {
    expect(called.args).toEqual(['foo', 'bar', 'baz'])
    done()
  }
  const config = { onCall }
  call(config, handlers, basicMultistep, 'foo', 'bar', 'baz')
})

test('onCallComplete', done => {
  const now = Date.now()
  const onCallComplete = complete => {
    expect(complete.success).toEqual(true)
    expect(complete.fn).toEqual(basic)
    expect(complete.result).toEqual('foo')
    expect(typeof complete.latency).toEqual('number')
    expect(complete.start).toBeGreaterThanOrEqual(now)
    expect(complete.end).toBeGreaterThanOrEqual(complete.start)
    done()
  }
  const config = { onCallComplete, name: 'telemetry' }
  call(config, handlers, basic, 'foo')
})

test('onCallComplete for errors', done => {
  const now = Date.now()
  const onCallComplete = complete => {
    expect(complete.success).toEqual(false)
    expect(complete.fn).toEqual(badHandler)
    expect(complete.result.message).toEqual('oops')
    expect(typeof complete.latency).toEqual('number')
    expect(complete.start).toBeGreaterThanOrEqual(now)
    expect(complete.end).toBeGreaterThanOrEqual(complete.start)
    done()
  }
  const config = { onCallComplete, name: 'telemetry' }
  call(config, handlers, badHandler, 'foo').catch(e => e)
})
