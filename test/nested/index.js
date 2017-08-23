'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);
const a = { value1: 'a1', value2: 'a2' };
const ab = { value1: 'a1', value2: 'b2' };

describe('nested config', function () {
  it('overrides parent config', function () {
    assert.deepEqual(flavors('a', options()), a);
    assert.deepEqual(flavors('a-b', options()), ab);
  });
  it('uses custom separator', function () {
    assert.deepEqual(flavors('a/b', options({ configNameSeparator: '/' })), ab);
  });
  it('uses custom configuration directory name', function () {
    assert.deepEqual(flavors('a-b', options({ configDirName: 'config' })), ab);
  });
});
