'use strict'

const { assert, flavors, options } = require('../common.js')(__dirname);
const c = { value1: 'a1', value2: 'c2' };

describe('dependent config', function () {
  it('overrides config it depends on', function () {
    assert.deepEqual(flavors('c', options()), c);
  });
});
