'use strict';

module.exports = {
  a: 1,
  customCommand: {
    echo: {
      action: (args, config) => ({
        b: config.a + 1,
        c: args
      })
    }
  }
};
