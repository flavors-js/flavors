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
  const merge = typeof options.merge === 'function' ? options.merge : (a, b) => Object.assign({}, a, b);

  function getConfigNameParts(configName) {
    return configName.split(configNameSeparator);
  }

  const
    originalConfigName = configName,
    originalConfigNameParts = getConfigNameParts(configName);

  function load(config) {
    const parentConfig = config.extends === undefined
      ? (config.nameParts.length > 0
        ? resolve(config.nameParts.slice(0, config.nameParts.length - 1))
        : undefined)
      : resolve(config.extends);
    const loadedParentConfig = parentConfig ? load(parentConfig) : {};
    const info = {
      config: {
        name: originalConfigName,
        nameParts: originalConfigNameParts
      },
      currentConfig: {
        dir: config.dir,
        name: config.name,
        nameParts: config.nameParts
      }
    };
    if (config.file) {
      info.currentConfig.file = config.file;
    }
    if (parentConfig) {
      info.parentConfig = {
        dir: parentConfig.dir,
        name: parentConfig.name,
        nameParts: parentConfig.nameParts
      };
      if (parentConfig.file) {
        info.parentConfig.file = parentConfig.file;
      }
    }
    const loadedConfig = config.load(loadedParentConfig, info);
    return transform(config.merge ? merge(loadedParentConfig, loadedConfig, info) : loadedConfig, info);
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
      return resolveConfigItemPath(configDirName, configFileName + extension);
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
