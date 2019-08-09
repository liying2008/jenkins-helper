var NodeServices = (function () {
  "use strict";

  var lastInterval = undefined;

  function start() {
    // 开启浏览器后先执行一遍
    queryNodeStatus();
    StorageService.addStorageListener(storageChange);
    StorageService.getOptions(function (options) {
      refreshNodeStatus(options.nodeRefreshTime || 2)
    });
  }

  function refreshNodeStatus(refreshTime) {
    if (lastInterval !== undefined) {
      window.clearInterval(lastInterval)
    }
    lastInterval = window.setInterval("NodeServices.queryNodeStatus()", refreshTime * 3600 * 1000)
  }

  function storageChange(changes) {
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      console.log('changes', changes);
      var newOptions = changes[StorageService.keyForOptions].newValue;
      var oldOptions = changes[StorageService.keyForOptions].oldValue;
      var newRefreshTime = newOptions.nodeRefreshTime;
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.nodeRefreshTime) {
        console.log('refreshNodeStatus', newRefreshTime);
        refreshNodeStatus(newRefreshTime)
      }
    }
  }

  function queryNodeStatus() {
    console.log('queryNodeStatus', 'queryNodeStatus');
    StorageService.getNodeStatus(function (result) {
      for (var jenkinsUrl in result) {
        // console.log('node', result[jenkinsUrl]);
        if (!result.hasOwnProperty(jenkinsUrl)) {
          continue
        }
        if (!result[jenkinsUrl].hasOwnProperty('monitoredNodes')) {
          continue
        }
        (function (url) {
          // console.log('queryNodeStatus - url', url);
          var encodeParam = encodeURI('computer[displayName,offline,monitorData[*]]');
          var jsonUrl = url + 'computer/api/json?tree=' + encodeParam;

          Tools.getFetchOption(jsonUrl, function (header) {
            fetch(jsonUrl, header).then(function (res) {
              if (res.ok) {
                return res.json();
              } else {
                return Promise.reject(res);
              }
            }).then(function (data) {
              var computers = data.computer;
              for (var i = 0; i < computers.length; i++) {
                var displayName = computers[i].displayName;
                if (!result[url]['monitoredNodes'].hasOwnProperty(displayName)) {
                  continue
                }
                var nodeUrl = url + 'computer/' + displayName + '/';
                if (displayName === 'master') {
                  nodeUrl = url + 'computer/(master)/';
                }
                var workingDirectory = 'N/A';
                var remainingDiskSpace = 'N/A';
                var responseTime = 'N/A';
                var offline = computers[i].offline;
                if (!offline) {
                  var diskSpaceMonitor = computers[i].monitorData['hudson.node_monitors.DiskSpaceMonitor'];
                  if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('path')) {
                    workingDirectory = diskSpaceMonitor.path;
                  }
                  var size = undefined;
                  if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('size')) {
                    size = diskSpaceMonitor.size;
                  }
                  if (size) {
                    remainingDiskSpace = (size / 1024.0 / 1024.0 / 1024.0).toFixed(2) + ' GB';
                  }
                  var responseTimeMonitor = computers[i].monitorData['hudson.node_monitors.ResponseTimeMonitor'];
                  if (responseTimeMonitor && responseTimeMonitor.hasOwnProperty('average')) {
                    responseTime = responseTimeMonitor.average + 'ms';
                  }
                }
                var diskSpaceThreshold = result[url]['monitoredNodes'][displayName]['diskSpaceThreshold'];
                checkDiskSpace(url, displayName, remainingDiskSpace, diskSpaceThreshold, offline);

                result[url]['monitoredNodes'][displayName] = {
                  nodeUrl,
                  workingDirectory,
                  remainingDiskSpace,
                  responseTime,
                  monitoring: true,
                  diskSpaceThreshold,
                  offline
                };
                result[url].status = 'ok';
                StorageService.saveNodeStatus(result, function () {
                })
              }
            }).catch(function (e) {
              console.error("获取数据失败", e);
              result[url].status = 'error';
              StorageService.saveNodeStatus(result, function () {
              })
            });
          })
        })(jenkinsUrl)
      }
    })
  }

  function checkDiskSpace(jenkinsUrl, displayName, remainingDiskSpace, diskSpaceThreshold, offline) {
    var message = '';
    if (offline) {
      message = browser.i18n.getMessage("nodeOfflineNotifications")
    } else if (remainingDiskSpace === 'N/A') {
      message = browser.i18n.getMessage("fetchNodeInfoFailedNotifications")
    } else {
      var remainingDiskSpaceInt = parseInt(remainingDiskSpace.replace('GB', '').trim());
      if (remainingDiskSpaceInt <= diskSpaceThreshold) {
        message = browser.i18n.getMessage("insufficientDiskSpaceNotifications", [remainingDiskSpace])
      }
    }

    if (message) {
      // 显示通知
      browser.notifications.create(null, {
        type: 'basic',
        iconUrl: 'img/computer48.png',
        title: displayName,
        message: message,
        priority: 2,
      }).then(function (notificationId) {
        console.log('checkDiskSpace notifications', notificationId)
      });
    }
  }

  return {
    start,
    queryNodeStatus,
  }
})();
