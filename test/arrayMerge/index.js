'use strict';

const {assert, flavors, options} = require('../common.js')(__dirname);

describe('array merging', function () {
  it('overwrites', function () {
    assert.deepEqual(flavors('a-b', options({deepmergeOptions: {arrayMerge: (d, s) => s}})), {a: [4, 5, 6]});
  });
  it('concatenates', function () {
    assert.deepEqual(flavors('a-b', options()), {a: [1, 2, 3, 4, 5, 6]});
  });
});
