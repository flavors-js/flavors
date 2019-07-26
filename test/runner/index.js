'use strict';

const
  assert = require('assert'),
  child = require('child_process'),
  path = require('path'),
  runner = require('../../runner'),
  cliPath = path.resolve(__dirname, '..', '..', 'runner.js');

function testPath(...names) {
  return path.resolve(__dirname, ...names);
}

function runnerOutputEqual(expected, command, configName, testName, options) {
  let actual = runner(command, configName, Object.assign({workingDir: testPath(testName)}, options));
  if (actual.stdout) {
    actual = actual.stdout.toString();
    expected += '\n';
  }
  assert.deepStrictEqual(actual, expected);
}

function cliOutputEquals(expected, args, dir, env = {}) {
  assert.deepStrictEqual(child.execFileSync(`${cliPath}`, args, {
    cwd: testPath(dir),
    env: Object.assign({}, process.env, env)
  }).toString(), expected + '\n');
}

describe('runner', () => {
  it('initializes environment', () => {
    runnerOutputEqual('1', 'echo $value', 'a', 'commonTest');
  });
  it('flattens config', () => {
    runnerOutputEqual('1', 'echo $nested_value', 'a', 'nested');
  });
  it('applies transform', () => {
    runnerOutputEqual('2 2 2', {
      args: ['$value', '$value'],
      command: 'echo $value'
    }, 'a', 'commonTest', {
      transform: require(testPath('transform', 'index.js'))
    });
  });
  it('applies configDirName', () => {
    runnerOutputEqual('1', 'echo $value', 'a', 'configDirName', {
      configDirName: 'config'
    });
  });
  it('applies configFileName', () => {
    runnerOutputEqual('1', 'echo $value', 'a', 'configFileName', {
      configFileName: 'custom'
    });
  });
  it('applies loaders', () => {
    runnerOutputEqual('123', 'echo $value1$value2$value3', 'a-b-c', 'loaders', {
      loaders: [require('../../jsonLoader'), require('../../jsLoader'), require('flavors-loader-yaml')]
    });
  });
  describe('runs', () => {
    it('string', () => {
      runnerOutputEqual('1 1 1', {
        args: ['$value', '$value'],
        command: 'echo $value'
      }, 'a', 'commonTest');
    });
    it('string array', () => {
      runnerOutputEqual('1', ['echo', '$value'], 'a', 'commonTest');
    });
    it('function returning string', () => {
      runnerOutputEqual('1', config => `echo ${config.value}`, 'a', 'commonTest');
    });
    it('command structure', () => {
      runnerOutputEqual('1', config => ({
        command: 'echo',
        args: [config.value]
      }), 'a', 'commonTest');
    });
    it('plugin structure', () => {
      runnerOutputEqual('2 2 2', {
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
    it('config command', () => runnerOutputEqual({
      b: 2,
      c: ['a', 'b', 'c']
    }, ['echo', 'action', 'a', 'b', 'c'], 'a', 'configCommand'));
    it('custom command property', () => runnerOutputEqual({
      b: 2,
      c: ['a', 'b', 'c']
    }, ['echo', 'action', 'a', 'b', 'c'], 'a', 'customCommandProperty', {command: {property: 'customCommand'}}));
    it('usual command if config command not found', () => runnerOutputEqual('notExists a b c', ['echo', 'notExists', 'a', 'b', 'c'], 'a', 'configCommand'));
    it('config command with provided runner', () => runnerOutputEqual('1 2', ['test', '2'], 'a', 'configCommandRunner'));
    it('usual command when config command is disabled', () => runnerOutputEqual('1', ['echo', '1'], 'a', 'configCommandDisable', {command: {enabled: false}}));
  });

  it('uses options from flavors options file: ' + runner.optionsFile, () => {
    cliOutputEquals('2', ['echo', '$value'], 'flavorsOptions', {FLAVORS_CONFIG_NAME: 'test'});
  });

  it('uses options from local flavors options file: ' + runner.localOptionsFile, () => {
    cliOutputEquals('14', ['echo', '$value1$value2'], 'localFlavorsOptions', {FLAVORS_CONFIG_NAME: 'a-b'});
  });

  it('uses custom flavors options file', () => {
    const testName = 'customFlavorsOptions';
    cliOutputEquals('1', ['echo', '$value'], testName, {
      FLAVORS_CONFIG_NAME: 'test',
      FLAVORS_OPTIONS_PATH: testPath(testName, testName + '.js')
    });
  });

  it('uses custom flavors local options file', () => {
    const testName = 'customFlavorsLocalOptions';
    cliOutputEquals('14', ['echo', '$value1$value2'], testName, {
      FLAVORS_CONFIG_NAME: 'a-b',
      FLAVORS_LOCAL_OPTIONS_PATH: testPath(testName, 'customFlavorsOptions.local.js')
    });
  });

  it('uses custom flavors config name', () => {
    cliOutputEquals('1', ['echo', '$value'], 'customConfigName', {FLAVORS_CONFIG_NAME: 'custom'});
  });

  it('uses custom flavors options directory', () => {
    it('uses options from flavors options file', () => {
      const optionsDir = testPath('customFlavorsOptionsDir');
      cliOutputEquals('1', ['echo', '$value'], '', {
        FLAVORS_OPTIONS_PATH: optionsDir,
        FLAVORS_LOCAL_OPTIONS_PATH: optionsDir
      });
    });
  });
});