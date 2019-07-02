'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('config', () => {
  it('extends and overrides parent config', () => {
    assert.deepStrictEqual(flavors('b-c', options()), { value1: 'a', value2: 'b', value3: 'c' });
  });
  it('extends multiple parent configs', () => {
    assert.deepStrictEqual(flavors('d', options()), { value1: 'a', value2: 'b', value3: 'd' });
  });
});
