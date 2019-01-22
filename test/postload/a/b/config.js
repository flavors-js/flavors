'use strict';

module.exports = {
  postload: config => ({
    b: config.a + 1
  })
};
