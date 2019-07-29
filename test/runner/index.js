'use strict';

const
  assert = require('assert'),
  path = require('path'),
  runner = require('../../runner');

function testPath(...names) {
  return path.resolve(__dirname, ...names);
}

function outputEqual(expected, command, configName, testName, options) {
  let actual = runner(command, configName, Object.assign({workingDir: testPath(testName)}, options));
  if (actual.stdout) {
    actual = actual.stdout.toString();
    expected += '\n';
  }
  assert.deepStrictEqual(actual, expected);
}

describe('runner', () => {
  it('initializes environment', () => {
    outputEqual('1', 'echo $value', 'a', 'commonTest');
  });
  it('flattens config', () => {
    outputEqual('1', 'echo $nested_value', 'a', 'nested');
  });
  it('applies transform', () => {
    outputEqual('2 2 2', {
      args: ['$value', '$value'],
      command: 'echo $value'
    }, 'a', 'commonTest', {
      transform: require(testPath('transform', 'index.js'))
    });
  });
  it('applies configDirName', () => {
    outputEqual('1', 'echo $value', 'a', 'configDirName', {
      configDirName: 'config'
    });
  });
  it('applies configFileName', () => {
    outputEqual('1', 'echo $value', 'a', 'configFileName', {
      configFileName: 'custom'
    });
  });
  it('applies loaders', () => {
    outputEqual('123', 'echo $value1$value2$value3', 'a-b-c', 'loaders', {
      loaders: [require('../../jsonLoader'), require('../../jsLoader'), require('flavors-loader-yaml')]
    });
  });
  describe('runs', () => {
    it('string', () => {
      outputEqual('1 1 1', {
        args: ['$value', '$value'],
        command: 'echo $value'
      }, 'a', 'commonTest');
    });
    it('string array', () => {
      outputEqual('1', ['echo', '$value'], 'a', 'commonTest');
    });
    it('function returning string', () => {
      outputEqual('1', config => `echo ${config.value}`, 'a', 'commonTest');
    });
    it('command structure', () => {
      outputEqual('1', config => ({
        command: 'echo',
        args: [config.value]
      }), 'a', 'commonTest');
    });
    it('plugin structure', () => {
      outputEqual('2 2 2', {
        args: ['$value', '$value'],
        plugin: {
          command: config => ({
            command: 'echo',
            args: [config.value]
          }),
          options: {
            transform: config => {
              config.value += 1;
              return config;
            }
          }
        }
      }, 'a', 'commonTest');
    });
    it('config command', () => outputEqual({
      b: 2,
      c: ['a', 'b', 'c']
    }, ['echo', 'action', 'a', 'b', 'c'], 'a', 'configCommand'));
    it('custom command property', () => outputEqual({
      b: 2,
      c: ['a', 'b', 'c']
    }, ['echo', 'action', 'a', 'b', 'c'], 'a', 'customCommandProperty', {command: {property: 'customCommand'}}));
    it('usual command if config command not found', () => outputEqual('notExists a b c', ['echo', 'notExists', 'a', 'b', 'c'], 'a', 'configCommand'));
    it('config command with provided runner', () => outputEqual('1 2', ['test', '2'], 'a', 'configCommandRunner'));
    it('usual command when config command is disabled', () => outputEqual('1', ['echo', '1'], 'a', 'configCommandDisable', {command: {enabled: false}}));
  });
});