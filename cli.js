#!/usr/bin/env node
'use strict';

function parseArgs(argv) {
  let loaders;
  if (argv.loader) {
    if (Array.isArray(argv.loader) && argv.loader.length > 0) {
      loaders = argv.loader;
    } else {
      loaders = [argv.loader];
    }
    loaders = loaders.map(require);
  }
  let command, plugin;
  if (argv.plugin) {
    plugin = require(argv.command);
  } else {
    command = argv.command;
  }
  return {
    command: {
      command,
      plugin,
      args: argv.args
    },
    configName: argv.name,
    options: {
      configDirName: argv.dirName,
      configFileName: argv.fileName,
      configNameSeparator: argv.separator,
      loaders: loaders,
      workingDir: argv.workingDir
    },
    optionsPath: argv.optionsPath
  };
}

function resolveOptionsPath(customPath, optionsFile) {
  const path = require('path');

  return customPath
    ? (customPath.endsWith('.js')
      ? customPath
      : path.resolve(customPath, optionsFile))
    : path.resolve(process.cwd(), optionsFile);
}

function tryOptionsWithPath(path, throwError = false) {
  if (path) {
    try {
      return require(path);
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND' || throwError) {
        throw e;
      }
    }
  }
  return {};
}

function tryOptions(customPath, optionsFile, throwError = false) {
  return tryOptionsWithPath(resolveOptionsPath(customPath, optionsFile), throwError);
}

function loadOptions(argv) {
  const {options: argvOptions, optionsPath, ...rest} = parseArgs(argv);
  return {
    options: require('deepmerge').all([
      {
        spawnOptions: {
          stdio: 'inherit'
        }
      },
      tryOptionsWithPath(optionsPath, true),
      argvOptions,
      tryOptions(process.env.FLAVORS_OPTIONS_PATH, module.exports.optionsFile),
      tryOptions(process.env.FLAVORS_LOCAL_OPTIONS_PATH, module.exports.localOptionsFile)
    ]),
    ...rest
  };
}

function print(argv) {
  const {configName, options} = loadOptions(argv);
  process.stdout.write(JSON.stringify(require('.')(configName, options), null, 2) + '\n');
}

function run(argv) {
  const {configName, command, options} = loadOptions(argv);
  return require('./runner')(command, configName || process.env.FLAVORS_CONFIG_NAME, options);
}

module.exports = () => {
  const yargs = require('yargs');

  // noinspection BadExpressionStatementJS
  yargs// eslint-disable-line no-unused-expressions
    .usage('flavors - print loaded configuration or configure environment and run command.')
    .command({
      command: ['print', '*'],
      desc: 'Load and print configuration with specified name in JSON format',
      handler: print
    })
    .command({
      command: 'run <command> [args..]',
      desc: 'Load configuration and run command',
      builder: yargs => yargs.options({
        'plugin': {
          alias: 'p',
          boolean: true,
          describe: 'Treat command as Node.js module name or path.'
        }
      }),
      handler: run
    })
    .options({
      'dir-name': {
        alias: 'd',
        describe: 'Configuration directory name'
      },
      'file-name': {
        alias: 'f',
        describe: 'Configuration file name (excluding extension)'
      },
      'loader': {
        alias: 'l',
        describe: 'Name of a Node.js module or a path to it'
      },
      'name': {
        alias: 'n',
        required: !process.env.FLAVORS_CONFIG_NAME,
        describe: 'Configuration name. Use this option or FLAVORS_CONFIG_NAME environment variable.'
      },
      'options-path': {
        alias: 'o',
        describe: 'Path to options file'
      },
      'separator': {
        alias: 's',
        describe: 'Configuration name separator'
      },
      'working-dir': {
        alias: 'w',
        describe: 'Directory name where configuration resolving starts from'
      }
    })
    .epilogue('for more information, please read our documentation at https://github.com/flavors-js/flavors.')
    .help()
    .version()
    .wrap(yargs.terminalWidth())
    .argv;
};

module.exports.localOptionsFile = 'flavorsOptions.local.js';
module.exports.optionsFile = 'flavorsOptions.js';

if (require.main === module) {
  module.exports();
}
