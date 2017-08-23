'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('custom merge', function () {
  it('is applied', function () {
    assert.deepEqual(
      flavors('a-b', options({ merge: (parentConfig, config) => ({ parent: parentConfig, config: config }) })),
      { config: { value: 'b' }, parent: { config: { value: 'a' }, parent: { config: { value: 'base' }, parent: {} } } });
  });
});
