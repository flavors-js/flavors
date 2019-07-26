'use strict';

module.exports = function(workingDir, options) {
  return {
    assert: require('assert'),
    flavors: require('../..'),
    options: customOptions => require('deepmerge').all([{ workingDir }, options || {}, customOptions || {}])
  };
};
