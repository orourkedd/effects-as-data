const { readFile, writeFile } = require('./fs')
const { deepEqual } = require('assert')

describe('fs.js', () => {
  describe('readFile()', () => {
    it('should return a readFile action', () => {
      const expected = {
        type: 'node',
        module: 'fs',
        function: 'readFile',
        args: ['/path/to/file.txt', { encoding: 'utf8' }],
      }
      const actual = readFile('/path/to/file.txt', { encoding: 'utf8' })
      deepEqual(actual, expected)
    })
  })

  describe('writeFile()', () => {
    it('should return a writeFile action', () => {
      const expected = {
        type: 'node',
        module: 'fs',
        function: 'writeFile',
        args: ['/path/to/file.txt', 'foobar', { encoding: 'utf8' }],
      }
      const actual = writeFile('/path/to/file.txt', 'foobar', {
        encoding: 'utf8',
      })
      deepEqual(actual, expected)
    })
  })
})
