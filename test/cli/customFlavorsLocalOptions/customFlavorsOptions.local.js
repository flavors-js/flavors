'use strict';

module.exports = {
  transform: config => {
    config.value2 *= 2;
    return config;
  }
};