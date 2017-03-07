function sendEmail ({user}) {
  return {
    status: 'sent',
    user
  }
}

module.exports = {
  sendEmail
}
