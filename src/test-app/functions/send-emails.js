const { sendEmail } = require('../actions')
const { map, prop } = require('../../util')

function* sendEmails(users) {
  let emails = map(sendEmail, users)
  let result = yield emails
  const propPayload = prop('payload')
  return map(propPayload, result)
}

module.exports = {
  sendEmails,
}
