const
  fs = require('fs'),
  path = require('path');

module.exports = (configName, options) => {
  const configNameSeparator = options.configNameSeparator || '-';
  const configDirName = options.configDirName || '';
  const configFileName = options.configFileName || 'config';
  const workingDir = options.workingDir || process.cwd();
  const loaders = options.loaders || [require('./jsLoader'), require('./jsonLoader')];

  function resolveConfigDir(configs) {
    return path.resolve(workingDir, ...configs.map(i => path.join(configDirName, i)));
  }

  function resolveConfigItemPath(configs, ...parts) {
    return path.resolve(resolveConfigDir(configs), ...parts);
  }

  function resolveConfigFile(configs, extension) {
    return resolveConfigItemPath(configs, configFileName + extension);
  }

  function getConfigNameParts(configName) {
    return configName.split(configNameSeparator);
  }

  function resolve(configName) {
    let configNameParts;
    if (typeof configName === 'string') {
      configNameParts = getConfigNameParts(configName);
    } else {
      configNameParts = configName;
    }

    function loadParentConfig() {
      return configNameParts.length > 1
        ? resolve(configNameParts.slice(0, configNameParts.length - 1))
        : {};
    }

    let config = {};

    for (let loader of loaders) {
      const configFile = resolveConfigFile(configNameParts, loader.extension);
      if (fs.existsSync(configFile)) {
        config = loader.loader(configFile);
        break;
      }
    }

    if (config.load === undefined) {
      config.load = c => c;
    }
    if (config.merge === undefined) {
      config.merge = true;
    }
    const parentConfig = config.merge ? (config.extends === undefined ? loadParentConfig() : resolve(config.extends)) : {};
    return Object.assign(parentConfig, config.load(parentConfig));
  }

  return resolve(configName);
};
