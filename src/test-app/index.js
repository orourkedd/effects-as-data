const { sendEmailsToUsers } = require('./functions')
const { run } = require('../run')
const handlers = require('./handlers')

run(handlers, sendEmailsToUsers)
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error))
