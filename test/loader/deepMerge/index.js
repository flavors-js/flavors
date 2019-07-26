'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('deep merge', function () {
  it('is applied', function () {
    assert.deepStrictEqual(flavors('a-b', options()), { value: { value1: 'a', value2: 'b' } });
  });
});
