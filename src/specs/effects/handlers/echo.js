function echo({ value }) {
  return value
}

function echoPromise({ value }) {
  return Promise.resolve(value)
}

module.exports = {
  echo,
  echoPromise
}
