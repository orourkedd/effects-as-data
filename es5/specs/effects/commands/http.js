'use strict';

function httpGet(url) {
  return {
    type: 'httpGet',
    url: url
  };
}

module.exports = {
  httpGet: httpGet
};
//# sourceMappingURL=http.js.map