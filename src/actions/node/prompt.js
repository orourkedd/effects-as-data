const prompt = (question) => {
  return {
    type: 'prompt',
    question
  }
}

module.exports = {
  prompt
}
