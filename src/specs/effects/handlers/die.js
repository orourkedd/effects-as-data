function die({ message }) {
  throw new Error(message);
}

function dieFromRejection({ message }) {
  return Promise.reject(new Error(message));
}

module.exports = {
  die,
  dieFromRejection
};
