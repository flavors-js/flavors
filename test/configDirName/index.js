'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname, { configDirName: 'config' });

describe('config', function () {
  it('uses custom configuration directory name', function () {
    assert.deepEqual(flavors('a', options()), { value: 'a' });
  });
});
