'use strict';

const merge = require('deepmerge');

function resolveConfigCommand(command, args, config, options) {
  if (options.command.enabled && typeof command === 'string') {
    const commandAndArgs = [command, ...args];
    command = config[options.command.property];

    let argIndex = 0;
    for (; argIndex < commandAndArgs.length && typeof command === 'object'; argIndex++) {
      command = command[commandAndArgs[argIndex]];
    }

    args = commandAndArgs.slice(argIndex);

    if (command === undefined) {
      command = commandAndArgs[0];
      args = commandAndArgs.slice(1);
    }
  }
  return {command, args};
}

function normalizeCommand(command, args, config) {
  function throwCommand() {
    throw new Error('"command" parameter has invalid type');
  }

  if (typeof args === 'function') {
    args = args(config);
  }

  if (typeof command === 'function') {
    command = command(config);
    if (command === undefined) {
      command = () => undefined;
      return;
    }
  }

  if (Array.isArray(command)) {
    if (command.length === 0) {
      throwCommand();
    } else {
      args = [...command.slice(1), ...args];
      command = command[0];
    }
  } else if (typeof command === 'object') {
    if (command.args) {
      args = [...command.args, ...args];
    }
    command = command.command;
  } else if (typeof command !== 'string') {
    throwCommand();
  }

  return {args, command};
}

function resolvePlugin(command, options) {
  let args = [];
  if (command.plugin) {
    if (command.args) {
      args = command.args;
    }
    command = command.plugin;
  }
  let pluginOptions = command.options;
  if (pluginOptions) {
    if (typeof pluginOptions === 'function') {
      pluginOptions = pluginOptions(options);
    }
    options = merge(options, pluginOptions);
    command = command.command;
  }

  return {args, command, options};
}

function runCommand(command, args, config, options) {
  if (typeof command === 'function') {
    return command(args, config, (c, runnerOptions) => resolveAndRunCommand(c, [], config, merge(options, runnerOptions || {})));
  }

  const child = require('child_process'),
    defaultSpawnOptions = {
      shell: true
    };

  return (options.async ? child.spawn : child.spawnSync)(command, args, merge.all([defaultSpawnOptions, {
    env: Object.assign({}, process.env, require('flat').flatten(config, {delimiter: '_'})),
  }, (options.spawnOptions || {})]));
}

function resolveCommand(command, args, config, options) {
  ({args, command} = normalizeCommand(command, args, config));
  return resolveConfigCommand(command, args, config, options);
}

function resolveAndRunCommand(command, args, config, options) {
  ({args, command} = resolveCommand(command, args, config, options));
  return runCommand(command, args, config, options);
}

module.exports = (command, configName, options) => {
  options = merge(module.exports.defaultOptions, options);
  let args;
  ({args, command, options} = resolvePlugin(command, options));
  return resolveAndRunCommand(command, args, require('.')(configName, options), options);
};

module.exports.defaultOptions = {
  command: {
    property: 'command',
    enabled: true
  }
};

