const { getUsers } = require('./get-users')
const { sendEmails } = require('./send-emails')
const { sendEmailsToUsers } = require('./send-emails-to-users')

module.exports = {
  getUsers,
  sendEmails,
  sendEmailsToUsers,
}
