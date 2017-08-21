'use strict'

const { assert, flavors, options } = require('../common.js')(__dirname);

describe('configName and currentConfigName', function () {
  it('is passed', function () {
    assert.deepEqual(flavors('a-b', options()), {
      config: { name: 'a-b', nameParts: ['a', 'b'] },
      currentConfig: { name: 'a', nameParts: ['a'] }
    });
  });
});
