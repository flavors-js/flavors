'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname);
const a = { value1: 'a1', value2: 'a2' };

describe('config', function () {
  it('uses custom loaders', function () {
    assert.deepStrictEqual(flavors('a', options({loaders: [require('../../../jsLoader')]})), a);
  });
  it('returns empty object without loaders', function () {
    assert.deepStrictEqual(flavors('a', options({loaders: []})), {});
  });
});
