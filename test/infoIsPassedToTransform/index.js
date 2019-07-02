'use strict';

const {assert, flavors, options} = require('../common.js')(__dirname);
const path = require('path');

describe('info', function () {
  it('is passed to `transform`', function () {
    const o = options({
      transform: (config, info) => {
        if (config.value === 1) {
          assert.deepStrictEqual(info, {
            config: {
              dir: path.resolve(__dirname, 'a', 'b'),
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
            },
            parentConfigs: [{
              dir: __dirname,
              name: '',
              nameParts: []
            }],
            options: o
          });
        } else if (config.value === 2) {
          assert.deepStrictEqual(info, {
            config: {
              dir: path.resolve(__dirname, 'a', 'b'),
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
            },
            parentConfigs: [{
              dir: path.resolve(__dirname, 'a'),
              file: path.resolve(__dirname, 'a', 'config.js'),
              name: 'a',
              nameParts: ['a']
            }],
            options: o
          });
        }
        return config;
      }
    });
    flavors('a-b', o);
  });
});
