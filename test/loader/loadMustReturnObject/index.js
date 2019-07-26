'use strict';

const { assert, flavors, options } = require('../common.js')(__dirname),
  path = require('path');

describe('when `load` function returns value of specified type it must', () => {
  describe('fail for', () => {
    function test(name) {
      it(name, () => assert.throws(() => flavors(name, options()), e => e.message === `${path.resolve(__dirname, name, 'config.js')} must return object.`));
    }

    test('function');
    test('undefined');
    test('string');
    test('number');
    test('array');
  });

  describe('succeed for', () => {
    function test(name) {
      it(name, () => assert.doesNotThrow(() => flavors(name, options())));
    }

    test('object');
  });
});
