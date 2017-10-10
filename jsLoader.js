'use strict';

module.exports = {
  extension: '.js',
  loader: configFile => {
    const config = require(configFile);
    let _extends, load, merge;
    if (typeof config === 'function') {
      load = config;
    } else if (typeof config === 'object') {
      if (typeof config.extends === 'string' || Array.isArray(config.extends)) {
        _extends = config.extends;
      }
      if (typeof config.merge === 'boolean') {
        merge = config.merge;
      }
      if (typeof config.load === 'object') {
        load = () => config.load;
      } else if (typeof config.load === 'function') {
        load = config.load;
      }
      if (_extends === undefined && load === undefined && merge === undefined) {
        load = () => config;
      }
    } else {
      throw new Error(`Can't load configuration from ${configFile}.`);
    }
    return {
      extends: _extends,
      load: load,
      merge: merge
    };
  }
};
