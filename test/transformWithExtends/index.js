'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('transform', function () {
  it('is applied when `extends` is used', function () {
    assert.deepEqual(
      flavors('b-c', options({
        transform: c => {
          c.values = c.values || [];
          c.values.push(c.value);
          return c;
        }
      })),
      { value: 'c', values: ['base', 'a', 'b', 'c'] });
  });
});
