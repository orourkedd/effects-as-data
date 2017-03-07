const { isFailure } = require('../../util')
const { call } = require('../../actions')
const { sendEmails } = require('./send-emails')
const { getUsers } = require('./get-users')

function * sendEmailsToUsers () {
  let users = yield call(getUsers)
  if (isFailure(users)) return users
  let sendResults = yield call(sendEmails, users.payload)
  return sendResults
}

module.exports = {
  sendEmailsToUsers
}
