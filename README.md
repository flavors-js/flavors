<div align="center">
  <a href="https://github.com/flavors-js/flavors">
    <img width="200" height="200" src="https://flavors-js.github.io/flavors/logo.svg">
  </a>
  <br>
  <br>

[![npm](https://img.shields.io/npm/v/flavors.svg)](https://www.npmjs.com/package/flavors)
[![Build Status](https://travis-ci.org/flavors-js/flavors.svg?branch=master)](https://travis-ci.org/flavors-js/flavors)
[![David](https://img.shields.io/david/flavors-js/flavors.svg)](https://david-dm.org/flavors-js/flavors)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Join the chat at https://gitter.im/flavors-js/flavors](https://badges.gitter.im/flavors-js/flavors.svg)](https://gitter.im/flavors-js/flavors?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

</div>

# flavors

Node.js configuration library.

## Install

```bash
$ npm install --save-dev flavors
```

## Usage

```javascript
const flavors = require('flavors');
const config = flavors('my-config', {
  // options
});
```

In all examples below it's assumed that a script that loads configuration using `flavors` is executed from the same
directory configuration is loaded from.
But in real use cases most likely it will be different and you may need to specify [workingDir option](#workingdir-option).

### Extending configuration

There are two ways to extend configuration.

#### Directory tree

Configuration with name `a-b-c` is loaded from the following configuration files:
- `config.js`
- `a/config.js`
- `a/b/config.js`
- `a/b/c/config.js`
- `a/b/c/config.js`

On each step loaded configuration is merged with configuration from previous step.

#### Using `extends` property

See `extends` property [documentation](#extends-configuration-property).

### Configuration file

Configuration files can be provided in multiple formats.
Each supported format requires special loader to be implemented.<br>
This module comes with several built-in loaders:
- [JavaScript loader](#javascript-loader)
- [JSON loader](#json-loader)

Also other loaders are available as separate node.js modules:
- [YAML loader](https://github.com/flavors-js/flavors-loader-yaml)

You can use custom loaders by setting `loaders` [option](#loaders-option).

#### Defining custom loader

Custom loader definition is a node.js module that exports object with the following properties:

##### `extension` loader property

Extension of files that are accepted by this loader.

##### `loader` loader property

Function that accepts path to configuration file and returns an object with the following properties:
 - [`extends`](#extends-configuration-property)
 - [`load`](#load-configuration-property) (must be a function)
 - [`merge`](#merge-configuration-property)
 - [`postload`](#postload-configuration-property)

#### JavaScript loader

Loads configuration from node.js module.<br>
You can use this loader with `require('flavors/jsLoader')` (for example in `loaders` [option](#loaders-option)).

##### Object export

Simply export an object with configuration values.

*dev/config.js:*

```javascript
module.exports = {
  value: 1
};
```

*load configuration:*

```javascript
const config = flavors('dev');
```

##### Function export

Export function that accepts a configuration the current configuration extends.

*a/config.js:*

```javascript
module.exports = {
  value: 1
};
```

*a/b/config.js:*

```javascript
module.exports = (config, info) => {
  return {
    parentValue: config.value,
    value: 2,
  };
};
```

*load configuration:*

```javascript
const config = flavors('a-b');
```

will load

```javascript
{
  parentValue: 1,
  value: 2
}
```

Here `a-b` configuration extends `a` configuration. So `a` configuration will be loaded and passed to an exported function.

Read more about function export in `load` configuration property [documentation](#load-configuration-property).

##### General configuration definition

The above object and function exports are the special cases of a general configuration definition:

```javascript
module.exports = {
  extends: 'some-other-configuration',
  merge: false,
  load: config => {
    return {
      value: config.value + 1
    };
  }
};
```

In this general case exported object must contain at least of the following special properties.
In other case exported object is treated as [simple object export](#object-export).

###### `load` configuration property

Object or function accepting configuration the current configuration extends.
If no other special properties are specified then it can be simplified to [simple object export](#object-export) or [function export](#function-export).<br>
Function accepts two parameters:
- extended configuration object
- object with the additional information:

```javascript
{
  "config": {
    "name": "a-b",
    "nameParts": ["a", "b"]
  },
  "currentConfig": {
    "dir": "/home/user/project/a",
    "file": "/home/user/project/a/config.js",
    "name": "a",
    "nameParts": ["a"]
  },
  "parentConfig": {
    "dir": "/home/user/project",
    "name": "",
    "nameParts": []
  },
  "options": {
    "configDirName": "/home/user/project"
  }
}
```

* `config` contains properties of the configuration that we want to load
  - `dir` is the directory where configuration is located
  - `name` is the name of configuration
  - `nameParts` is the name of configuration splitted by [`configNameSeparator` options](#confignameseparator-option)
* `currentConfig` contains properties of the configuration in extension hierarchy that is currently being loaded:
  - `dir`
  - `file` is a path to the configuration file if it exists
  - `name`
  - `nameParts`
* `parentConfig` contains properties of the parent configuration if the current config has single parent:
  - `dir`
  - `file`
  - `name`
  - `nameParts`
* `parentConfigs` is an array of parent configurations if the current configuration has multiple parents
* `options` contains object passed to [`options` parameter](#options-parameter)

###### `extends` configuration property

Sometimes it's not very convenient to have deeply nested directory trees like `a/b/c/d/config.js` and long names like `a-b-c-d`.
You can use alternative way of extending configuration by using `extends` property.

For example, you have `d` configuration located in `d/config.js`:

```javascript
module.exports = {
  extends: 'a-b-c',
  load: config => {
    return {
      value: config.value + 1
    }
  }
};
```

This will load `a-b-c` configuration and pass it as `config` parameter to `load` function.

###### `merge` configuration property

By default it's `true` and loaded configuration is merged with the configuration it extends.

For example, you have `a` and `a-b` configurations:

*a/config.js:*

```javascript
module.exports = {
  value1: 1
};
```

*a/b/config.js:*

```javascript
module.exports = {
  value2: 2
};
```

*load configuration:*

```javascript
const config = flavors('a-b');
```

will load

```javascript
{
  value1: 1,
  value2: 2
}
```

But if you change *a/b/config.js* to:

```javascript
module.exports = {
  merge: false,
  load: {
    value2: 2
  }
};
```

then config will be loaded as:

```javascript
{
  value2: 2
}
```

###### `postload` configuration property

This property is used to set configuration that applies after loading all child configurations.

*a/config.js:*

```javascript
module.exports = {
  postload: config => {
    config.a = 3;
    return {
      b: 4
    };
  }
};
```

*a/b/config.js:*

```javascript
module.exports = {
  a: 1,
  b: 2
};
```

*loaded config:*

```javascript
{
  a: 3,
  b: 4
}
```

#### JSON loader

Configuration definition is the same as when using JavaScript loader [general configuration definition](#general-configuration-definition) except that obviously `load` property can be only an object.<br>
You can use this loader with `require('flavors/jsonLoader')` (for example in `loaders` [option](#loaders-option)).

### Parameters

```javascript
const config = flavors(configName, options);
```

#### `configName` parameter

Required name of the configuration to load.
It can be simple name like `dev` and such configuration will be loaded
from `dev/config.js` or it can be composite name like `dev-custom` and
the configuration will be loaded from `dev/config.js` and `dev/custom/config.js`.
See also [extending configuration](#extending-configuration).

#### `options` parameter

Optional object parameter containing various options.

##### `configDirName` option

By default composite configurations are loaded from a simple directory structure like `a/b/c` for configuration name `a-b-c`.
But with multiple configurations like `a-b-c`, `a-b-d`, `a-e-f`, `g-h-i` and when each configuration directory stores additional files it can be more convenient to place configurations under separate directories.
For instance, setting `configDirName` to `config` makes it search configuration `a-b-c` under `config/a/config/b/config/c/config` directory.

##### `configFileName` option

Configuration file name. Default value is `config`.

##### `configNameSeparator` option

String which separates composite configuration name parts. Default value is `-`.<br>
If you want to use configuration names like `a/b/c` then set it to `/`.

##### `loaders` option

Array of loaders for various configuration file formats.
By default it's an array of built-in loaders: [JavaScript loader](#javascript-loader) and [JSON loader](#json-loader).<br>
For example, to disable JSON loader and use only JavaScript loader pass `[require('flavors/jsLoader')]` as `loaders` option value.

##### `merge` option

Function that merges configurations in extension hierarchy.
It accepts previous configuration object as first argument, current configuration object as second and object with the additional information as third (see `load` configuration property [documentation](#load-configuration-property)).
By default it calls [deepmerge](https://github.com/KyleAMathews/deepmerge) with default options.

##### `reversePostload` option

By default [`postload`](#postload-configuration-property) functions are applied in direct order. Passing `true` for this option reverses the order of `postload` execution, so that for the `a-b-c` configuration with `a/config.js`, `a/b/config.js` and `a/b/c/config.js` files firstly `postload` from `a/b/c/config.js` is executed, then returned result is merged with already loaded `a-b-c` configuration, then the same is performed for `a/b/config.js` and `a/config.js` files.

##### `transform` option

Function that applies transformation to each configuration in extension hierarchy.<br>
It accepts configuration object as first argument and object with the additional information as second (see `load` configuration property [documentation](#load-configuration-property)).

##### `workingDir` option

By default configuration is resolved relatively to `process.cwd()` path.
For example, if your script is located at `/home/user/myProject/loadConfig.js` and executed from `/home/user/` path then
the `dev` configuration will be loaded from the `/home/user/dev/config.js` which is not the right path.

To change this behaviour specify `workingDir` option:

*/home/user/myProject/loadConfig.js:*:

```javascript
const config = flavors('dev', {workingDir: __dirname})
```

## Maintainers

- [@mxl](https://github.com/mxl)

## License

See the [LICENSE](https://github.com/flavors-js/flavors/blob/master/LICENSE) file for details.
