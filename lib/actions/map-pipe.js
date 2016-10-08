'use strict';

function mapPipe(contextKey, pipe, state) {
  return {
    type: 'mapPipe',
    pipe: pipe,
    contextKey: contextKey,
    state: state
  };
}

module.exports = {
  mapPipe: mapPipe
};
//# sourceMappingURL=map-pipe.js.map