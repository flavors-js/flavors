'use strict';

module.exports = {
  postload: config => ({
    b: (config.a || 0) + 1,
    e: config.f - 1
  })
};
