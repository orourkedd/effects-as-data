const { httpGet, httpDelete, httpPost, httpPut } = require('./http')
const { deepEqual } = require('assert')

const defaultHeaders = {
  'Content-Type': 'application/json;charset=UTF-8',
}

describe('actions', () => {
  describe('httpGet', () => {
    it('should return an httpGet object', () => {
      const actual = httpGet('http://www.example.com')
      const expected = {
        type: 'httpGet',
        url: 'http://www.example.com',
        headers: {},
        options: {},
      }
      deepEqual(actual, expected)
    })

    it('should return an httpGet', () => {
      const actual = httpGet(
        'http://www.example.com',
        {
          'Content-Type': 'application/json',
        },
        {
          credentials: 'include',
        }
      )

      const expected = {
        type: 'httpGet',
        url: 'http://www.example.com',
        headers: {
          'Content-Type': 'application/json',
        },
        options: {
          credentials: 'include',
        },
      }

      deepEqual(actual, expected)
    })
  })

  describe('httpDelete', () => {
    it('should return an httpDelete object', () => {
      const actual = httpDelete('http://www.example.com')
      const expected = {
        type: 'httpDelete',
        url: 'http://www.example.com',
        headers: {},
        options: {},
      }
      deepEqual(actual, expected)
    })

    it('should return an httpDelete', () => {
      const actual = httpDelete(
        'http://www.example.com',
        {
          'Content-Type': 'application/json',
        },
        {
          credentials: 'include',
        }
      )

      const expected = {
        type: 'httpDelete',
        url: 'http://www.example.com',
        headers: {
          'Content-Type': 'application/json',
        },
        options: {
          credentials: 'include',
        },
      }

      deepEqual(actual, expected)
    })
  })

  describe('httpPost', () => {
    it('should return an httpPost object', () => {
      const actual = httpPost('http://www.example.com', { foo: 'bar' })
      const expected = {
        type: 'httpPost',
        url: 'http://www.example.com',
        payload: { foo: 'bar' },
        headers: defaultHeaders,
        options: {},
      }
      deepEqual(actual, expected)
    })

    it.only('should return an httpPost', () => {
      const actual = httpPost(
        'http://www.example.com',
        { foo: 'bar' },
        {
          'Content-Type': 'text/html',
        },
        {
          credentials: 'include',
        }
      )

      const expected = {
        type: 'httpPost',
        url: 'http://www.example.com',
        payload: { foo: 'bar' },
        headers: {
          'Content-Type': 'text/html',
        },
        options: {
          credentials: 'include',
        },
      }

      deepEqual(actual, expected)
    })
  })

  describe('httpPut', () => {
    it('should return an httpPut object', () => {
      const actual = httpPut('http://www.example.com', { foo: 'bar' })
      const expected = {
        type: 'httpPut',
        url: 'http://www.example.com',
        payload: { foo: 'bar' },
        headers: defaultHeaders,
        options: {},
      }
      deepEqual(actual, expected)
    })

    it('should return an httpPut', () => {
      const actual = httpPut(
        'http://www.example.com',
        { foo: 'bar' },
        {
          'Content-Type': 'text/html',
        },
        {
          credentials: 'include',
        }
      )

      const expected = {
        type: 'httpPut',
        url: 'http://www.example.com',
        payload: { foo: 'bar' },
        headers: {
          'Content-Type': 'text/html',
        },
        options: {
          credentials: 'include',
        },
      }

      deepEqual(actual, expected)
    })
  })
})
