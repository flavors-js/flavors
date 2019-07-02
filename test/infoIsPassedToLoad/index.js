'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);
const path = require('path');

describe('info', function () {
  it('is passed to `load`', function () {
    const o = options();
    assert.deepStrictEqual(flavors('a-b', o), {
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
  });
});
