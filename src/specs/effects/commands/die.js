function die(message = "") {
  return {
    type: "die",
    message
  };
}

function dieFromRejection(message = "") {
  return {
    type: "dieFromRejection",
    message
  };
}

module.exports = {
  die,
  dieFromRejection
};
