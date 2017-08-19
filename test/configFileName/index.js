'use strict'

const { assert, flavors, options } = require('../common.js')(__dirname, { configFileName: 'custom.js' });
const a = { value: 'a' };

describe('config', function () {
  it('uses custom configuration file name', function () {
    assert.deepEqual(flavors('a', options()), a);
  });
});
