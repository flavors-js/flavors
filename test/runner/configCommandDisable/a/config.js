'use strict';

module.exports = {
  a: 1,
  command: {
    echo: () => {
      throw new Error();
    },
    test: (args, config, runner) => runner(['echo', 'test'], {command: {enabled: false}})
  }
};
