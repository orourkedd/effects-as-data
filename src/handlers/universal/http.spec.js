const { httpGetFn, httpDeleteFn, httpPostFn, httpPutFn } = require('./http')
const { deepEqual } = require('assert')
const { stub } = require('sinon')

describe('handlers', () => {
  describe('httpGetFn', () => {
    it('should make a get request', () => {
      const get = stub().returns(Promise.resolve({ foo: 'bar' }))
      const action = {
        type: 'httpGet',
        url: 'http://www.example.com',
        headers: {
          test: 'header',
        },
        options: {
          credentials: 'test',
        },
      }

      return httpGetFn(get, action).then(result => {
        const options = {
          credentials: 'test',
          headers: {
            test: 'header',
          },
        }
        deepEqual(get.firstCall.args[0], options)
        deepEqual(get.firstCall.args[1], 'http://www.example.com')
        deepEqual(result, { foo: 'bar' })
      })
    })
  })

  describe('httpDeleteFn', () => {
    it('should make a delete request', () => {
      const remove = stub().returns(Promise.resolve({ foo: 'bar' }))
      const action = {
        type: 'httpDelete',
        url: 'http://www.example.com',
        headers: {
          test: 'header',
        },
        options: {
          credentials: 'test',
        },
      }

      return httpDeleteFn(remove, action).then(result => {
        const options = {
          credentials: 'test',
          headers: {
            test: 'header',
          },
        }
        deepEqual(remove.firstCall.args[0], options)
        deepEqual(remove.firstCall.args[1], 'http://www.example.com')
        deepEqual(result, { foo: 'bar' })
      })
    })
  })

  describe('httpPostFn', () => {
    it('should make a post request', () => {
      const post = stub().returns(Promise.resolve({ foo: 'bar' }))
      const action = {
        type: 'httpPost',
        url: 'http://www.example.com',
        headers: {
          test: 'header',
        },
        options: {
          credentials: 'test',
        },
        payload: {
          pay: 'load',
        },
      }

      return httpPostFn(post, action).then(result => {
        const options = {
          credentials: 'test',
          headers: {
            test: 'header',
          },
        }
        deepEqual(post.firstCall.args[0], options)
        deepEqual(post.firstCall.args[1], 'http://www.example.com')
        deepEqual(post.firstCall.args[2], { pay: 'load' })
        deepEqual(result, { foo: 'bar' })
      })
    })
  })

  describe('httpPutFn', () => {
    it('should make a put request', () => {
      const put = stub().returns(Promise.resolve({ foo: 'bar' }))
      const action = {
        type: 'httpPut',
        url: 'http://www.example.com',
        headers: {
          test: 'header',
        },
        options: {
          credentials: 'test',
        },
        payload: {
          pay: 'load',
        },
      }

      return httpPutFn(put, action).then(result => {
        const options = {
          credentials: 'test',
          headers: {
            test: 'header',
          },
        }
        deepEqual(put.firstCall.args[0], options)
        deepEqual(put.firstCall.args[1], 'http://www.example.com')
        deepEqual(put.firstCall.args[2], { pay: 'load' })
        deepEqual(result, { foo: 'bar' })
      })
    })
  })
})
