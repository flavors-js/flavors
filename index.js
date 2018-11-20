'use strict';

const
  deepmerge = require('deepmerge'),
  fs = require('fs'),
  path = require('path');

module.exports = (configName, options) => {
  const configNameSeparator = options.configNameSeparator || '-';
  const configDirName = options.configDirName || '';
  const configFileName = options.configFileName || 'config';
  const workingDir = options.workingDir || process.cwd();
  const loaders = options.loaders || [require('./jsLoader'), require('./jsonLoader')];
  const transform = typeof options.transform === 'function' ? options.transform : _ => _;
  const merge = typeof options.merge === 'function'
    ? options.merge
    : (x, y) => deepmerge(x, y, options.deepmergeOptions);
  const postload = [];

  function getConfigNameParts(configName) {
    return configName.split(configNameSeparator);
  }

  const
    originalConfigName = configName,
    originalConfigNameParts = getConfigNameParts(configName),
    originalConfigDir = resolveConfigDir(originalConfigNameParts);

  function resolveConfigDir(nameParts) {
    return path.resolve(workingDir, ...nameParts.map(i => path.join(configDirName, i)));
  }

  function load(config) {
    const parentConfigs =
      (config.extends === undefined
        ? (config.nameParts.length > 0
          ? [config.nameParts.slice(0, config.nameParts.length - 1)]
          : [])
        : (Array.isArray(config.extends) ? config.extends : [config.extends])).map(resolve);
    const loadedParentConfig = parentConfigs.map(load).reduce(merge, {});
    const info = {
      config: {
        dir: originalConfigDir,
        name: originalConfigName,
        nameParts: originalConfigNameParts
      },
      currentConfig: {
        dir: config.dir,
        name: config.name,
        nameParts: config.nameParts
      },
      options
    };
    if (config.file) {
      info.currentConfig.file = config.file;
    }
    info.parentConfigs = parentConfigs.map(i => {
      const c = {
        dir: i.dir,
        name: i.name,
        nameParts: i.nameParts
      };
      if (i.file) {
        c.file = i.file;
      }
      return c;
    });
    if (parentConfigs.length === 1) {
      info.parentConfig = info.parentConfigs[0];
    }
    if (config.postload !== undefined) {
      postload.push({ config, info });
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

    config.dir = resolveConfigDir(config.nameParts);

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

  const config = load(resolve(configName));
  return postload.reduce((current, next) => merge(current, next.config.postload(current, next.info) || {}), config);
};
