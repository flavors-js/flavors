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
      return config.nameParts.length > 0
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
        dir: config.dir,
        file: config.file,
        name: config.name,
        nameParts: config.nameParts
      }
    };
    return transform(Object.assign(config.merge ? parentConfig : {}, config.load(parentConfig, info)), info);
  }

  function resolve(configName) {
    let config = {};
    if (typeof configName === 'string') {
      config.name = configName;
      config.nameParts = getConfigNameParts(configName);
    } else {
      config.nameParts = configName;
      config.name = config.nameParts.join(configNameSeparator);
    }

    config.dir = path.resolve(workingDir, ...config.nameParts.map(i => path.join(configDirName, i)));

    function resolveConfigItemPath(...parts) {
      return path.resolve(config.dir, ...parts);
    }

    function resolveConfigFile(extension) {
      return resolveConfigItemPath(configFileName + extension);
    }

    let configFile;

    for (let loader of loaders) {
      configFile = resolveConfigFile(loader.extension);
      if (fs.existsSync(configFile)) {
        config.file = configFile;
        config = Object.assign(loader.loader(configFile), config);
        break;
      }
    }

    if (config.load === undefined) {
      config.load = () => ({});
    }
    if (config.merge === undefined) {
      config.merge = true;
    }
    return config;
  }

  return load(resolve(configName));
};
