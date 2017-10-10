'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('config', () => {
  it('extends and overrides parent config', () => {
    assert.deepEqual(flavors('b-c', options()), { value1: 'a', value2: 'b', value3: 'c' });
  });
  it('extends multiple parent configs', () => {
    assert.deepEqual(flavors('d', options()), { value1: 'a', value2: 'b', value3: 'd' });
  });
});
