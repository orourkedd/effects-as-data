const { call } = require('../index')
const { handlers, functions, cmds } = require('./effects')
const { basicMultistep, badHandler, basic } = functions
const { sleep } = require('./test-util')

test('telemetry - onCommandComplete', () => {
  return new Promise(async resolve => {
    let telemetry = []
    const onCommandComplete = t => {
      telemetry.push(t)
    }
    const config = { onCommandComplete, name: 'telemetry' }
    const now = Date.now()
    await call(config, handlers, basicMultistep, 'foo')
    setImmediate(() => {
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
      resolve()
    })
  })
})

test('telemetry on error - onCommandComplete', () => {
  return new Promise(async resolve => {
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
    setImmediate(() => {
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
    resolve()
  })
})

test('onCall', () => {
  return new Promise(async resolve => {
    const onCall = called => {
      expect(called.args).toEqual(['foo', 'bar', 'baz'])
      resolve()
    }
    const config = { onCall }
    await call(config, handlers, basicMultistep, 'foo', 'bar', 'baz')
  })
})

test('onComplete',  () => {
  return new Promise(async resolve => {
    const now = Date.now()
    const onComplete = complete => {
      expect(complete.result).toEqual('foo')
      expect(typeof complete.latency).toEqual('number')
      expect(complete.start).toBeGreaterThanOrEqual(now)
      expect(complete.end).toBeGreaterThanOrEqual(complete.start)
      resolve()
    }
    const config = { onComplete, name: 'telemetry' }
    await call(config, handlers, basic, 'foo')
  })
})
