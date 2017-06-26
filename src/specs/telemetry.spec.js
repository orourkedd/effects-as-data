const { actions, handlers } = require('../node')
const { run } = require('../run')
const { deepEqual } = require('assert')
const { delay } = require('./test-util')
const { success, failure } = require('../util')

describe('telemetry', () => {
  it('should call onActionComplete with latency', () => {
    function* test() {
      yield actions.echo(32)
      yield actions.echo(33)
      yield [actions.echo(34), actions.echo(35)]
    }

    let actual = []

    const config = {
      onActionComplete: stats => {
        actual.push(stats)
      },
      name: 'foo'
    }

    const expected = [
      { index: 0, step: 0, action: actions.echo(32), result: success(32) },
      { index: 0, step: 1, action: actions.echo(33), result: success(33) },
      { index: 0, step: 2, action: actions.echo(34), result: success(34) },
      { index: 1, step: 2, action: actions.echo(35), result: success(35) }
    ]

    return run(handlers, test, null, config).then(() => delay(50)).then(() => {
      for (let i = 0; i < expected.length; i++) {
        deepEqual(actual[i].action, expected[i].action)
        deepEqual(typeof actual[i].latency, 'number')
        deepEqual(typeof actual[i].start, 'number')
        deepEqual(typeof actual[i].end, 'number')
        deepEqual(actual[i].index, expected[i].index)
        deepEqual(actual[i].step, expected[i].step)
        deepEqual(actual[i].result, expected[i].result)
        deepEqual(actual[i].config, config)
      }
    })
  })

  it('should call onActionComplete with latency for failures', () => {
    function* test() {
      yield actions.echo(32)
      yield actions.echo(33)
      yield [actions.echo(34), actions.echo(35)]
    }

    let actual = []

    const config = {
      onActionComplete: stats => {
        actual.push(stats)
      },
      name: 'foo'
    }

    const expected = [
      { index: 0, step: 0, action: actions.echo(32), result: failure(32) },
      { index: 0, step: 1, action: actions.echo(33), result: failure(33) },
      { index: 0, step: 2, action: actions.echo(34), result: failure(34) },
      { index: 1, step: 2, action: actions.echo(35), result: failure(35) }
    ]

    const fakeHandlers = {
      echo: ({ payload }) => failure(payload)
    }

    return run(fakeHandlers, test, null, config)
      .then(() => delay(50))
      .then(() => {
        for (let i = 0; i < expected.length; i++) {
          deepEqual(actual[i].action, expected[i].action)
          deepEqual(typeof actual[i].latency, 'number')
          deepEqual(typeof actual[i].start, 'number')
          deepEqual(typeof actual[i].end, 'number')
          deepEqual(actual[i].index, expected[i].index)
          deepEqual(actual[i].step, expected[i].step)
          deepEqual(actual[i].result, expected[i].result)
          deepEqual(actual[i].config, config)
        }
      })
  })
})
