'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('dependent config', () => {
  it('overrides config it extends', () => {
    assert.deepEqual(flavors('b-c', options()), { value1: 'a', value2: 'b', value3: 'c' });
  });
});
