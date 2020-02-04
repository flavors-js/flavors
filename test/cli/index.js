'use strict';

const
  assert = require('assert'),
  child = require('child_process'),
  path = require('path'),
  cli = require('../../cli'),
  cliPath = path.resolve(__dirname, '..', '..', 'cli.js');

function testPath(...names) {
  return path.resolve(__dirname, ...names);
}

function outputEqual(expected, args, dir = '', env = {}) {
  assert.deepStrictEqual(child.execFileSync(cliPath, args, {
    cwd: testPath(dir),
    env: Object.assign({}, process.env, env)
  }).toString(), expected + '\n');
}

function runWithCwdOutputEqual(expected, cwd, args, env = {}) {
  return outputEqual(expected, ['run', ...args], cwd, env);
}

function runWithWorkingDirOutputEqual(expected, workingDir, name, command, options = [], env = {}) {
  return outputEqual(expected, ['-w', workingDir, '-n', name, ...options, 'run', ...command], '', env);
}

function printOutputEqual(expected, workingDir, name, args = [], env = {}) {
  return outputEqual(expected, ['print', '-w', workingDir, '-n', name, ...args], '', env);
}

describe('CLI', () => {
  it('prints config', () => printOutputEqual('{\n  "value": 1\n}', 'commonTest', 'a'));
  it('prints config as default command', () => outputEqual('{\n  "value": 1\n}', ['-w', 'commonTest', '-n', 'a']));
  it('initializes environment', () => runWithWorkingDirOutputEqual('1', 'commonTest', 'a', ['echo $value']));
  it('runs not quoted command', () => runWithWorkingDirOutputEqual('1', 'commonTest', 'a', ['echo', '1']));
  it('runs runs command with dash options', () => runWithWorkingDirOutputEqual('-t 1', 'commonTest', 'a', ['echo', '--', '-t', '1']));
  it('runs runs command with double-dash options', () => runWithWorkingDirOutputEqual('--test 1', 'commonTest', 'a', ['echo', '--', '--test', '1']));
  it('flattens config', () => runWithWorkingDirOutputEqual('1', 'nested', 'a', ['echo $nested_value']));
  it('applies configDirName', () => runWithWorkingDirOutputEqual('1', 'configDirName', 'a', ['echo $value'], ['-d', 'config']));
  it('applies configFileName', () => runWithWorkingDirOutputEqual('1', 'configFileName', 'a', ['echo $value'], ['-f', 'custom']));
  it('applies loaders', () => runWithWorkingDirOutputEqual('123', 'loaders', 'a-b-c', ['echo $value1$value2$value3', '-l', testPath('..', '..', 'jsonLoader.js'), testPath('..', '..', 'jsLoader.js'), 'flavors-loader-yaml']));
  it('uses options from flavors options file: ' + cli.optionsFile,
    () => runWithCwdOutputEqual('2', 'flavorsOptions', ['echo', '$value'], {FLAVORS_CONFIG_NAME: 'test'}));

  it('uses options from local flavors options file: ' + cli.localOptionsFile,
    () => runWithCwdOutputEqual('14', 'localFlavorsOptions', ['echo', '$value1$value2'], {FLAVORS_CONFIG_NAME: 'a-b'}));

  it('uses custom flavors options file', () => {
    const testName = 'customFlavorsOptions';
    runWithCwdOutputEqual('1', testName, ['echo', '$value'], {
      FLAVORS_CONFIG_NAME: 'test',
      FLAVORS_OPTIONS_PATH: testPath(testName, testName + '.js')
    });
  });

  it('uses custom flavors local options file', () => {
    const testName = 'customFlavorsLocalOptions';
    runWithCwdOutputEqual('14', testName, ['echo', '$value1$value2'], {
      FLAVORS_CONFIG_NAME: 'a-b',
      FLAVORS_LOCAL_OPTIONS_PATH: testPath(testName, 'customFlavorsOptions.local.js')
    });
  });

  it('uses custom flavors config name',
    () => runWithCwdOutputEqual('1', 'customConfigName', ['echo', '$value'], {FLAVORS_CONFIG_NAME: 'custom'}));

  it('uses custom flavors options directory', () => {
    it('uses options from flavors options file', () => {
      const optionsDir = testPath('customFlavorsOptionsDir');
      runWithCwdOutputEqual('1', '', ['echo', '$value'], {
        FLAVORS_OPTIONS_PATH: optionsDir,
        FLAVORS_LOCAL_OPTIONS_PATH: optionsDir
      });
    });
  });

  it('overrides options from file with CLI options',
    () => runWithCwdOutputEqual('4', 'overridesOptions', ['-n', 'test', '-f', 'customConfig', 'echo', '$value']));

  it('uses options from -o file path',
    () => runWithCwdOutputEqual('2', 'optionsFile', ['-n', 'test', '-o', testPath('optionsFile', 'customOptionsFile.js'), 'echo', '$value']));

  it('runs plugin', () => runWithWorkingDirOutputEqual('1', 'plugin', 'a', ['-p', testPath('plugin', 'plugin.js')]));
});
