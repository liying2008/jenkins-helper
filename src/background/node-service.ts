import {StorageService} from "@/libs/storage";
import {Tools} from "@/libs/tools";
import {Options} from "@/models/option";

export class NodeService {
  private static lastInterval: number | undefined = undefined;

  static start() {
    // 开启浏览器后先执行一遍
    NodeService.queryNodeStatus();
    StorageService.addStorageListener(NodeService.storageChange);
    StorageService.getOptions(function (options: Options) {
      NodeService.refreshNodeStatus(options.nodeRefreshTime || 2)
    });
  }

  private static refreshNodeStatus(refreshTime: string | number) {
    if (NodeService.lastInterval !== undefined) {
      window.clearInterval(NodeService.lastInterval)
    }
    NodeService.lastInterval = window.setInterval("NodeServices.queryNodeStatus()", Number(refreshTime) * 3600 * 1000)
  }

  private static storageChange(changes: any) {
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      console.log('changes', changes);
      const newOptions = changes[StorageService.keyForOptions].newValue;
      const oldOptions = changes[StorageService.keyForOptions].oldValue;
      const newRefreshTime = newOptions.nodeRefreshTime;
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.nodeRefreshTime) {
        console.log('refreshNodeStatus', newRefreshTime);
        NodeService.refreshNodeStatus(newRefreshTime)
      }
    }
  }

  static queryNodeStatus() {
    console.log('queryNodeStatus', 'queryNodeStatus');
    StorageService.getNodeStatus(function (result: any) {
      for (const jenkinsUrl in result) {
        // console.log('node', result[jenkinsUrl]);
        if (!result.hasOwnProperty(jenkinsUrl)) {
          continue
        }
        if (!result[jenkinsUrl].hasOwnProperty('monitoredNodes')) {
          continue
        }
        (function (url) {
          // console.log('queryNodeStatus - url', url);
          const encodeParam = encodeURI('computer[displayName,offline,monitorData[*]]');
          const jsonUrl = url + 'computer/api/json?tree=' + encodeParam;

          Tools.getFetchOption(jsonUrl, function (header: any) {
            fetch(jsonUrl, header).then(function (res) {
              if (res.ok) {
                return res.json();
              } else {
                return Promise.reject(res);
              }
            }).then(function (data) {
              const computers = data.computer;
              for (let i = 0; i < computers.length; i++) {
                const displayName = computers[i].displayName;
                if (!result[url]['monitoredNodes'].hasOwnProperty(displayName)) {
                  continue
                }
                let nodeUrl = url + 'computer/' + displayName + '/';
                if (displayName === 'master') {
                  nodeUrl = url + 'computer/(master)/';
                }
                let workingDirectory = 'N/A';
                let remainingDiskSpace = 'N/A';
                let responseTime = 'N/A';
                let offline = computers[i].offline;
                if (!offline) {
                  let diskSpaceMonitor = computers[i].monitorData['hudson.node_monitors.DiskSpaceMonitor'];
                  if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('path')) {
                    workingDirectory = diskSpaceMonitor.path;
                  }
                  let size = undefined;
                  if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('size')) {
                    size = diskSpaceMonitor.size;
                  }
                  if (size) {
                    remainingDiskSpace = (size / 1024.0 / 1024.0 / 1024.0).toFixed(2) + ' GB';
                  }
                  let responseTimeMonitor = computers[i].monitorData['hudson.node_monitors.ResponseTimeMonitor'];
                  if (responseTimeMonitor && responseTimeMonitor.hasOwnProperty('average')) {
                    responseTime = responseTimeMonitor.average + 'ms';
                  }
                }
                let diskSpaceThreshold = result[url]['monitoredNodes'][displayName]['diskSpaceThreshold'];
                NodeService.checkDiskSpace(url, displayName, remainingDiskSpace, diskSpaceThreshold, offline);

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

  private static checkDiskSpace(jenkinsUrl: string, displayName: string, remainingDiskSpace: string, diskSpaceThreshold: number, offline: boolean) {
    let message = '';
    if (offline) {
      message = browser.i18n.getMessage("nodeOfflineNotifications")
    } else if (remainingDiskSpace === 'N/A') {
      message = browser.i18n.getMessage("fetchNodeInfoFailedNotifications")
    } else {
      let remainingDiskSpaceInt = parseInt(remainingDiskSpace.replace('GB', '').trim());
      if (remainingDiskSpaceInt <= diskSpaceThreshold) {
        message = browser.i18n.getMessage("insufficientDiskSpaceNotifications", [remainingDiskSpace])
      }
    }

    if (message) {
      // 显示通知
      browser.notifications.create({
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

}
