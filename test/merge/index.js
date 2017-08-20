'use strict'

const { assert, flavors, options } = require('../common.js')(__dirname);
const ab = { value1: 'a1', value2: 'b2' };
const ac = { value2: 'c2' };

describe('config', function () {
  it('merges', function () {
    assert.deepEqual(flavors('a-b', options()), ab);
  });
  it('does not merge', function () {
    assert.deepEqual(flavors('a-c', options()), ac);
  });
});
