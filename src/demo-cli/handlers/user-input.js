const readline = require('readline')

const userInput = (action) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(action.question, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}

module.exports = {
  userInput
}
