# log4js-node-extension-autoreload

a simple function to make log4js file configuration auto-reload work again

## Install

`npm install --save log4js-node-extension-autoreload`

## How to Use

Example:

```javascript
var log4js = require('log4js');
var log4jsAutoreload = require('./index');

log4jsAutoreload(log4js, 'log4jsconf.json', { reloadSecs: 5 });

var log = log4js.getLogger();

setInterval(function() {
  log.debug('this is debug');
  log.info('this is info');
}, 1000);
```

## The Cause

From log4js 2, the autoreload support have been removed. Refer to [here](https://github.com/log4js-node/log4js-node/issues/497#issuecomment-312776289)

This package add a simple wrapper function to use [watchr](https://github.com/bevry/watchr) to add the support of autoreload when configuration file updated.
