'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('custom merge', function () {
  it('is applied', function () {
    assert.deepEqual(
      flavors('a-b', options({
        merge: (a, b) => ({ value: (a.value || '|') + b.value })
      })),
      { value: '|||0ab' });
  });
});
