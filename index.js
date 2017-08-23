'use strict';

const
  fs = require('fs'),
  path = require('path');

module.exports = (configName, options) => {
  const configNameSeparator = options.configNameSeparator || '-';
  const configDirName = options.configDirName || '';
  const configFileName = options.configFileName || 'config';
  const workingDir = options.workingDir || process.cwd();
  const loaders = options.loaders || [require('./jsLoader'), require('./jsonLoader')];
  const transform = typeof options.transform === 'function' ? options.transform : _ => _;

  function getConfigNameParts(configName) {
    return configName.split(configNameSeparator);
  }

  const
    originalConfigName = configName,
    originalConfigNameParts = getConfigNameParts(configName);

  function load(config) {
    function loadParentConfig() {
      return config.nameParts.length > 1
        ? load(resolve(config.nameParts.slice(0, config.nameParts.length - 1)))
        : {};
    }

    const parentConfig = config.extends === undefined ? loadParentConfig() : load(resolve(config.extends));
    const info = {
      config: {
        name: originalConfigName,
        nameParts: originalConfigNameParts
      },
      currentConfig: {
        name: config.name,
        nameParts: config.nameParts
      }
    };
    return transform(Object.assign(config.merge ? parentConfig : {}, config.load(parentConfig, info)), info);
  }

  function resolve(configName) {
    let configNameParts;
    if (typeof configName === 'string') {
      configNameParts = getConfigNameParts(configName);
    } else {
      configNameParts = configName;
      configName = configNameParts.join(configNameSeparator);
    }

    const configDir = path.resolve(workingDir, ...configNameParts.map(i => path.join(configDirName, i)));

    function resolveConfigItemPath(...parts) {
      return path.resolve(configDir, ...parts);
    }

    function resolveConfigFile(extension) {
      return resolveConfigItemPath(configFileName + extension);
    }

    let config = {};

    let configFile;

    for (let loader of loaders) {
      configFile = resolveConfigFile(loader.extension);
      if (fs.existsSync(configFile)) {
        config = loader.loader(configFile);
        break;
      }
    }

    if (config.load === undefined) {
      config.load = _ => ({});
    }
    if (config.merge === undefined) {
      config.merge = true;
    }
    config.name = configName;
    config.nameParts = configNameParts;
    return config;
  }

  return load(resolve(configName));
};
