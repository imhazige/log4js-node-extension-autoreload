var watchr = require('watchr');

let gpath = null;
let gops = null;
let stalker = null;
let glog4js = null;

export function configure(log4js, path, ops) {
  if (stalker) {
    try {
      stalker.close();
    } catch (err) {}
  }
  gpath = null;
  gops = null;
  glog4js = null;
  log4js.configure(path, ops);
  if (!ops.reloadSecs) {
    return;
  }
  gpath = path;
  gops = ops;
  glog4js = log4js;
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
        if (gpath) {
          glog4js.configure(gpath, gops);
          console.log('reload logconf', gpath);
        }
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
