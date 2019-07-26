'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('transform', function () {
  it('is applied', function () {
    assert.deepStrictEqual(
      flavors('a-b', options({transform: c => { c[c.value] = c.value; return c; }})),
      { value: 'b', a: 'a', b: 'b', base: 'base' });
  });
});
