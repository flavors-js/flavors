'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);
const a = { value: 'a' };

describe('flavors', function () {
  it('loads json config', function () {
    assert.deepEqual(flavors('a', options()), a);
  });
});
