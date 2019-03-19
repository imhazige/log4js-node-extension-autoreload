var watchr = require('watchr');
var fs = require('fs');
var path = require('path');

let gpath = null;
let gops = null;
let stalker = null;
let glog4js = null;

function refresh() {
  if (!gpath) {
    return;
  }
  // replace env vars
  let buffer = fs.readFileSync(gpath);
  let text = buffer.toString();
  try {
    //eval config
    text = eval('`' + text + '`');
    let jsonConfig = JSON.parse(text);
    glog4js.configure(jsonConfig, gops);
    console.info('reload logconf', gpath, jsonConfig);
  } catch (err) {
    console.error(`there are error on you config ${gpath} : ${err.message}`);
  }
}

function configure(log4js, path, ops) {
  if (stalker) {
    try {
      stalker.close();
    } catch (err) {}
  }
  gpath = null;
  gops = null;
  glog4js = null;
  ops = ops || { reloadSecs: 60 };
  if (!ops.reloadSecs) {
    log4js.configure(path, ops);
    return;
  } else {
    gpath = path;
    gops = ops;
    glog4js = log4js;
    refresh();
  }

  // Create the stalker for the path
  stalker = watchr.create(path);

  // Listen to the events for the stalker/watcher
  // http://rawgit.com/bevry/watchr/master/docs/index.html#watcher
  stalker.on('change', listener);
  stalker.on('log', console.log);
  stalker.once('close', function(reason) {
    console.log('closed', path, 'because', reason);
    stalker.removeAllListeners(); // as it is closed, no need for our change or log listeners any more
  });

  // Set the default configuration for the stalker/watcher
  // http://rawgit.com/bevry/watchr/master/docs/index.html#Watcher%23setConfig
  stalker.setConfig({
    stat: null,
    interval: ops.reloadSecs * 1000,
    persistent: true,
    catchupDelay: 2000,
    preferredMethods: ['watch', 'watchFile'],
    followLinks: true,
    ignorePaths: false,
    ignoreHiddenFiles: false,
    ignoreCommonPatterns: true,
    ignoreCustomPatterns: null
  });

  // Start watching
  stalker.watch(next);
}

function next(err) {
  if (err) return console.log('watch failed on', gpath, 'with error', err);
  console.log('watch successful on', gpath);
}

function listener(changeType, fullPath, currentStat, previousStat) {
  switch (changeType) {
    case 'update':
      //   console.log(
      //     'the file',
      //     fullPath,
      //     'was updated',
      //     currentStat,
      //     previousStat
      //   );
      glog4js.shutdown(() => {
        refresh();
      });

      break;
    case 'create':
      //   console.log('the file', fullPath, 'was created', currentStat);
      break;
    case 'delete':
      //   console.log('the file', fullPath, 'was deleted', previousStat);
      break;
  }
}

module.exports = configure;
