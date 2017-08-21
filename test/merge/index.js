'use strict'

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('configuration merging', function () {
  describe('is applied', function () {
    it('when `merge` is not specified', function () {
      assert.deepEqual(flavors('a-b', options()), { value1: 'a1', value2: 'b2' });
    });
  });
  describe('is not applied', function () {
    it('when `merge: false`', function () {
      assert.deepEqual(flavors('a-c', options()), { value2: 'c2' });
    });
    it('when `load` is not specified', function () {
      assert.deepEqual(flavors('a-d', options()), {});
    });
    it('but parent config is still passed to `load`', function () {
      assert.deepEqual(flavors('a-e', options()), {value: 'a1'});
    });
  });
});
