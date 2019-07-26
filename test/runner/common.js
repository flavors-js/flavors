'use strict';

module.exports = function(workingDir, options) {
  return {
    assert: require('assert'),
    flavors: require('..'),
    options: customOptions => Object.assign({ workingDir: workingDir }, options || {}, customOptions || {})
  };
};
