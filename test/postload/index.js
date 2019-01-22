'use strict';

const {assert, flavors, options} = require('../common.js')(__dirname);

describe('postload', function () {
  it('is applied', function () {
    assert.deepEqual(
      flavors('a-b-c', options()),
      {a: 2, b: 3, c: 1, d: -1, e: 2, f: 3});
  });
  it('is reversed', function () {
    assert.deepEqual(
      flavors('a-b-c', options({reversePostload: true})),
      {a: 2, b: 1, c: 1, d: 1, e: 2, f: 3}
    );
  });
});
