'use strict';

module.exports = {
  extension: '.json',
  loader: configFile => require('./jsLoader').loader(configFile)
};
