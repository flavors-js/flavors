const
  fs = require('fs'),
  path = require('path');

module.exports = (configName, options) => {
  const configNameSeparator = options.configNameSeparator || '-';
  const configDirName = options.configDirName || '';
  const configFileName = options.configFileName || 'config.js';
  const workingDir = options.workingDir || process.cwd();

  function resolveConfigDir(configs) {
    return path.resolve(workingDir, ...configs.map(i => path.join(configDirName, i)));
  }

  function resolveConfigItemPath(configs, ...parts) {
    return path.resolve(resolveConfigDir(configs), ...parts);
  }

  function resolveConfigFile(configs) {
    return resolveConfigItemPath(configs, configFileName);
  }

  function getConfigNameParts(configName) {
    return configName.split(configNameSeparator);
  }

  function getConfigName(configs) {
    return configs.join(configNameSeparator);
  }

  function resolve(configName, initialConfigName) {
    let configNameParts;
    if (typeof configName === 'string') {
      configNameParts = getConfigNameParts(configName);
    } else {
      configNameParts = configName;
      configName = getConfigName(configNameParts);
    }
    if (!initialConfigName) {
      initialConfigName = configName;
    }
    const configFile = resolveConfigFile(configNameParts);
    let config = {};

    function parentConfig() {
      return configNameParts.length > 1
        ? resolve(configNameParts.slice(0, configNameParts.length - 1), initialConfigName)
        : {};
    }

    if (fs.existsSync(configFile)) {
      config = require(configFile);
      if (typeof config === 'function') {
        config = (pc => Object.assign(pc, config(pc)))(parentConfig());
      } else if (typeof config === 'object') {
        if (typeof config.dependsOn === 'string' || Array.isArray(config.dependsOn)) {
          config = (c => Object.assign(c,
            typeof config.load === 'function'
              ? config.load(c)
              : (typeof config.load === 'object' ? config.load : {})))(resolve(config.dependsOn, initialConfigName));
        } else {
          config = Object.assign(parentConfig(), config);
        }
      } else {
        throw new Error(`Can't resolve '${configName}' configuration.`);
      }
    } else {
      config = parentConfig();
    }
    return config;
  }

  return resolve(configName);
};
