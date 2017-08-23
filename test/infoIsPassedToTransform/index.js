'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);
const path = require('path');

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
            dir: path.resolve(__dirname, 'a'),
            file: path.resolve(__dirname, 'a', 'config.js'),
            name: 'a',
            nameParts: ['a']
          },
          parentConfig: {
            dir: __dirname,
            name: '',
            nameParts: []
          }
        });
      } else if (config.value === 2) {
        assert.deepEqual(info, {
          config: {
            name: 'a-b',
            nameParts: ['a', 'b']
          },
          currentConfig: {
            dir: path.resolve(__dirname, 'a', 'b'),
            file: path.resolve(__dirname, 'a', 'b', 'config.js'),
            name: 'a-b',
            nameParts: ['a', 'b']
          },
          parentConfig: {
            dir: path.resolve(__dirname, 'a'),
            file: path.resolve(__dirname, 'a', 'config.js'),
            name: 'a',
            nameParts: ['a']
          }
        });
      }
      return config;
    }}));
  });
});
