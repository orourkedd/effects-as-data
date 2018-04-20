function die(message = "") {
  return {
    type: "die",
    message
  };
}

function dieFromRejection(message) {
  return {
    type: "dieFromRejection",
    message
  };
}

function httpGet(url) {
  return {
    type: "httpGet",
    url
  };
}

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
  die,
  dieFromRejection,
  echo,
  echoPromise,
  httpGet
};
