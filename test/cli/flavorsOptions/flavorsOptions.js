'use strict';

module.exports = {
  transform: config => {
    config.value++;
    return config;
  }
};