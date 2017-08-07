const { call } = require("../index")
const { handlers, functions, cmds } = require("./effects")
const { basicMultistep, badHandler, basic } = functions
const { sleep } = require("./test-util")

test("telemetry - onCommandComplete", async () => {
  let telemetry = []
  const onCommandComplete = t => {
    telemetry.push(t)
  }
  const config = { onCommandComplete, name: "telemetry" }
  const now = Date.now()
  await call(config, handlers, basicMultistep, "foo")
  await sleep(10)
  expect(telemetry.length).toEqual(2)
  telemetry.forEach((t, i) => {
    const message = "foo" + (i + 1)
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

test("telemetry on error - onCommandComplete", async () => {
  let telemetry
  const onCommandComplete = t => {
    telemetry = t
  }
  const config = { onCommandComplete }
  const now = Date.now()
  const message = "oops"
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
  expect(telemetry.result.message).toEqual("oops")
  expect(telemetry.config).toEqual(config)
})

test("onCall", done => {
  const onCall = called => {
    expect(called.args).toEqual(["foo", "bar", "baz"])
    done()
  }
  const config = { onCall }
  call(config, handlers, basicMultistep, "foo", "bar", "baz")
})

test("onComplete", done => {
  const now = Date.now()
  const onComplete = complete => {
    expect(complete.success).toEqual(true)
    expect(complete.fn).toEqual(basic)
    expect(complete.result).toEqual("foo")
    expect(typeof complete.latency).toEqual("number")
    expect(complete.start).toBeGreaterThanOrEqual(now)
    expect(complete.end).toBeGreaterThanOrEqual(complete.start)
    done()
  }
  const config = { onComplete, name: "telemetry" }
  call(config, handlers, basic, "foo")
})

test("onComplete for errors", done => {
  const now = Date.now()
  const onComplete = complete => {
    expect(complete.success).toEqual(false)
    expect(complete.fn).toEqual(badHandler)
    expect(complete.result.message).toEqual("oops")
    expect(typeof complete.latency).toEqual("number")
    expect(complete.start).toBeGreaterThanOrEqual(now)
    expect(complete.end).toBeGreaterThanOrEqual(complete.start)
    done()
  }
  const config = { onComplete, name: "telemetry" }
  call(config, handlers, badHandler, "foo").catch(e => e)
})
