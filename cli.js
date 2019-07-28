#!/usr/bin/env node
'use strict';

const merge = require('deepmerge');

function resolveOptionsPath(customPath, optionsFile) {
  return customPath
    ? (customPath.endsWith('.js')
      ? customPath
      : path.resolve(customPath, optionsFile))
    : path.resolve(process.cwd(), optionsFile);
}

const path = require('path'),
  defaultOptions = {
    spawnOptions: {
      stdio: 'inherit'
    }
  },
  localOptionsPath = resolveOptionsPath(process.env.FLAVORS_LOCAL_OPTIONS_PATH, 'flavorsOptions.local.js'),
  optionsPath = resolveOptionsPath(process.env.FLAVORS_OPTIONS_PATH, 'flavorsOptions.js'),
  localOptions = (() => {
    try {
      return require(localOptionsPath);
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        throw e;
      }
    }
    return {};
  })(),
  options = require(optionsPath);

require('./runner')(process.argv.slice(2), process.env.FLAVORS_CONFIG_NAME, merge.all([defaultOptions, options, localOptions]));