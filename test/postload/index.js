'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('postload', function () {
  it('is applied', function () {
    assert.deepEqual(
      flavors('a-b-c', options()),
      { a: 11, b: 22, c: 3 });
  });
});
