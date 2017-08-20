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

  function resolve(configName) {
    let configNameParts;
    if (typeof configName === 'string') {
      configNameParts = getConfigNameParts(configName);
    } else {
      configNameParts = configName;
      configName = getConfigName(configNameParts);
    }
    const configFile = resolveConfigFile(configNameParts);

    function loadParentConfig() {
      return configNameParts.length > 1
        ? resolve(configNameParts.slice(0, configNameParts.length - 1))
        : {};
    }

    let _extends, load, merge;
    if (fs.existsSync(configFile)) {
      const config = require(configFile);
      if (typeof config === 'function') {
        load = config;
      } else if (typeof config === 'object') {
        if (typeof config.extends === 'string') {
          _extends = config.extends;
        }
        if (typeof config.merge === 'boolean') {
          merge = config.merge !== false;
        }
        if (typeof config.load === 'object') {
          load = c => config.load;
        } else if (typeof config.load === 'function') {
          load = config.load;
        }
        if (_extends === undefined && load === undefined && merge === undefined) {
          load = c => config;
        }
      } else {
        throw new Error(`Can't resolve '${configName}' configuration.`);
      }
    }
    if (load === undefined) {
      load = c => c;
    }
    if (merge === undefined) {
      merge = true;
    }
    const parentConfig = merge ? (_extends === undefined ? loadParentConfig() : resolve(_extends)) : {};
    return Object.assign(parentConfig, load(parentConfig));
  }

  return resolve(configName);
};
