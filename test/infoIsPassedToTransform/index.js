'use strict'

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('info', function () {
  it('is passed to `transform`', function () {
    flavors('a-b', options({transform: (config, info) => {
      if (config.value === 1) {
        assert.deepEqual(info, {
          config: {
            name: 'a-b',
            nameParts: ['a', 'b']
          },
          currentConfig: {
            name: 'a',
            nameParts: ['a']
          }
        });
      } else if (config.value === 2) {
        assert.deepEqual(info, {
          config: {
            name: 'a-b',
            nameParts: ['a', 'b']
          },
          currentConfig: {
            name: 'a-b',
            nameParts: ['a', 'b']
          }
        });
      }
      return config;
    }}));
  });
});
