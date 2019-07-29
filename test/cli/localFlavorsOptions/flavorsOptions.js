'use strict';

module.exports = {
  transform: config => {
    config.value2++;
    return config;
  }
};