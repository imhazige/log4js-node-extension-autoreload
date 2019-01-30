var log4js = require('log4js');
var log4jsAutoreload = require('./index');

log4jsAutoreload(log4js, 'log4jsconf.json', { reloadSecs: 5 });

var log = log4js.getLogger();

setInterval(function() {
  log.debug('this is debug');
  log.info('this is info');
}, 1000);
