const { getUsers, sendEmails, sendEmailsToUsers } = require('./index')
const { testIt } = require('../../test')
const { sendEmail } = require('../actions')
const { success } = require('../../util')
const { call } = require('../../actions')

const testSendEmailsToUsers = testIt(sendEmailsToUsers)

describe('demo/users.js', () => {
  describe('#sendEmailsToUsers', () => {
    it(
      'should send emails to all users',
      testSendEmailsToUsers(() => {
        const sendEmailResults = [
          sendEmail({ id: 1 }),
          sendEmail({ id: 2 }),
          sendEmail({ id: 3 }),
        ]
        const users = [{ id: 1 }, { id: 2 }, { id: 3 }]

        //  prettier-ignore
        return [
          [null, call(getUsers)],
          [users, call(sendEmails, users)],
          [sendEmailResults, success(sendEmailResults)]
        ]
      })
    )
  })
})
