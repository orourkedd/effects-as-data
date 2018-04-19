function die({ message }) {
  throw new Error(message);
}

function dieFromRejection({ message }) {
  return Promise.reject(new Error(message));
}

function echo({ value }) {
  return value;
}

function echoPromise({ value }) {
  return Promise.resolve(value);
}

module.exports = {
  die,
  dieFromRejection,
  echo,
  echoPromise
};
