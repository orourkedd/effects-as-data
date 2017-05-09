const { sendEmails } = require('./index')
const { testIt } = require('../../test')
const { sendEmail } = require('../actions')
const { success, map, prop } = require('../../util')

const testSendEmail = testIt(sendEmails)

describe('demo/users.js', () => {
  describe('#sendEmails', () => {
    it(
      'should send emails to users',
      testSendEmail(() => {
        const users = [{ id: 1 }, { id: 2 }, { id: 3 }]
        const emails = map(sendEmail, users)
        const sendEmailResults1 = map(user => ({ status: 'sent', user }), users)
        const sendEmailResults2 = map(success, sendEmailResults1)

        const propPayload = prop('payload')
        const expectedReturn = map(propPayload, sendEmailResults2)

        //  prettier-ignore
        return [
        [users, emails],
        [sendEmailResults2, expectedReturn]
      ]
      })
    )
  })
})
