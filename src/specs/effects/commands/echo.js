function echo(value) {
  return {
    type: "echo",
    value
  };
}

function echoPromise(value) {
  return {
    type: "echoPromise",
    value
  };
}

module.exports = {
  echo,
  echoPromise
};
