# log4js-node-extension-autoreload

A simple function to make log4js file configuration auto-reload work again

## Install

`npm install --save log4js-node-extension-autoreload`

## How to Use

Example:

```javascript
var log4js = require('log4js');
var log4jsAutoreload = require('log4js-node-extension-autoreload');

log4jsAutoreload(log4js, 'log4jsconf.json', { reloadSecs: 5 });

var log = log4js.getLogger();

setInterval(function() {
  log.debug('this is debug');
  log.info('this is info');
}, 1000);
```

## Support javascript template configuration

```json
{
  "appenders": {
    "cheese": {
      "type": "file",
      "filename": "${process.env.PWD}/logs/app.log",
      "maxLogSize": 10485760,
      "backups": 10
    },
    "out": {
      "type": "stdout"
    }
  },
  "categories": {
    "default": { "appenders": ["cheese", "out"], "level": "debug" }
  }
}
```

### Why Need Support Template Configuration?

because when in develop mode, the relative path root resolved by log4js will some times set to place other than the project root folder, `process.cwd()` is also not the project root folder.

But normally process.env.PWD(Mac/Linux) will be the root folder of your project.

Or you can set the env on a shell to start the project, hence to make the config file not set any absolute path.

## The Cause

From log4js 2, the autoreload support have been removed. Refer to [here](https://github.com/log4js-node/log4js-node/issues/497#issuecomment-312776289).

This package implement a simple wrapper function to use [watchr](https://github.com/bevry/watchr) to provide the support of autoreload when configuration file be updated.

## Note:

If you are using file appender, you'd better set the filename to be a absolute path, because if you use relative path, it will relative to the CWD(current work directory). In some case, especially when develop, it will be the path of this package(under the node_modules) which invoke the `log4js.configure`.
