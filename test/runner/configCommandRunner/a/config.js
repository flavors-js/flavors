'use strict';

module.exports = {
  a: 1,
  command: {
    test: (args, config, runner) => runner(['echo', config.a, ...args])
  }
};
