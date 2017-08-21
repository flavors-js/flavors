'use strict'

const { assert, flavors, options } = require('../common.js')(__dirname);
const ab = { value1: 'b1', a1: 'a1', b1: 'b1' };

describe('mapper', function () {
  it('is applied', function () {
    assert.deepEqual(flavors('a-b', options({transform: c => { c[c.value1] = c.value1; return c; }})), ab);
  });
});
