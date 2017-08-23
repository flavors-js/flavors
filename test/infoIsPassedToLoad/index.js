'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);
const path = require('path');

describe('info', function () {
  it('is passed to `load`', function () {
    assert.deepEqual(flavors('a-b', options()), {
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
  });
});
