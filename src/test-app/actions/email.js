function sendEmail (user) {
  return {
    type: 'sendEmail',
    user
  }
}

module.exports = {
  sendEmail
}
