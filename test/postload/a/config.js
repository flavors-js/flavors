'use strict';

module.exports = {
  postload: config => ({
    a: config.c + 1,
    d: (config.e || 0) - 1
  })
};
