'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname, { configDirName: 'config' });

describe('config', function () {
  it('uses custom configuration directory name', function () {
    assert.deepStrictEqual(flavors('a', options()), { value: 'a' });
  });
});
