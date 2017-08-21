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

  function resolve(configName) {
    let configNameParts;
    if (typeof configName === 'string') {
      configNameParts = configName.split(configNameSeparator);
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

    function loadParentConfig() {
      return configNameParts.length > 1
        ? resolve(configNameParts.slice(0, configNameParts.length - 1))
        : {};
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
      config.load = _ => {};
    }
    if (config.merge === undefined) {
      config.merge = true;
    }
    const parentConfig = config.extends === undefined ? loadParentConfig() : resolve(config.extends);
    return transform(Object.assign(config.merge ? parentConfig : {}, config.load(parentConfig)), {
      configDir,
      configName,
      configFile
    });
  }

  return resolve(configName);
};
