'use strict';

const {assert, flavors, options} = require('../common.js')(__dirname),
  deepmerge = require('deepmerge');

describe('array merging', function () {
  it('overwrites', function () {
    assert.deepStrictEqual(flavors('a-b', options({merge: (x, y) => deepmerge(x, y, {arrayMerge: (d, s) => s})})), {a: [4, 5, 6]});
  });
  it('concatenates', function () {
    assert.deepStrictEqual(flavors('a-b', options()), {a: [1, 2, 3, 4, 5, 6]});
  });
});
