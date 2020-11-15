import { StorageChangeWrapper, StorageService } from '@/libs/storage'
import { Tools } from '@/libs/tools'
import { JenkinsNode } from '@/models/jenkins/node'
import { Nodes } from '@/models/node'
import { Options } from '@/models/option'

export class NodeService {
  private static lastInterval: number | undefined = undefined;

  static start() {
    // 开启浏览器后先执行一遍
    NodeService.queryNodeStatus()
    StorageService.addStorageListener(NodeService.storageChange)
    StorageService.getOptions().then((options: Options) => {
      NodeService.refreshNodeStatus(options.nodeRefreshTime || '2')
    })
  }

  private static refreshNodeStatus(refreshTime: string) {
    if (NodeService.lastInterval !== undefined) {
      window.clearInterval(NodeService.lastInterval)
    }
    NodeService.lastInterval = window.setInterval(() => { NodeService.queryNodeStatus() }, Number(refreshTime) * 3600 * 1000)
  }

  private static storageChange(changes: StorageChangeWrapper) {
    // console.log('storageChange::', changes)
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      console.log('changes', changes)
      const newOptions = changes[StorageService.keyForOptions].newValue
      const oldOptions = changes[StorageService.keyForOptions].oldValue
      const newRefreshTime = newOptions.nodeRefreshTime
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.nodeRefreshTime) {
        console.log('refreshNodeStatus', newRefreshTime)
        NodeService.refreshNodeStatus(newRefreshTime)
      }
    }
  }

  static queryNodeStatus() {
    console.log('queryNodeStatus', 'queryNodeStatus')
    StorageService.getNodeStatus().then((result: Nodes) => {
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
          const encodeParam = encodeURI('computer[displayName,offline,monitorData[*]]')
          const jsonUrl = url + 'computer/api/json?tree=' + encodeParam

          Tools.getFetchOption(jsonUrl).then((header: RequestInit) => {
            fetch(jsonUrl, header).then((res) => {
              if (res.ok) {
                return res.json()
              } else {
                return Promise.reject(res)
              }
            }).then((data: JenkinsNode) => {
              // console.log('queryNodeStatus::data', data)
              const computers = data.computer
              for (let i = 0; i < computers.length; i++) {
                const displayName = computers[i].displayName
                if (!result[url]['monitoredNodes'].hasOwnProperty(displayName)) {
                  continue
                }
                let nodeUrl = url + 'computer/' + displayName + '/'
                if (displayName === 'master') {
                  nodeUrl = url + 'computer/(master)/'
                }
                let workingDirectory = 'N/A'
                let remainingDiskSpace = 'N/A'
                let responseTime = 'N/A'
                const offline = computers[i].offline
                if (!offline) {
                  const diskSpaceMonitor = computers[i].monitorData['hudson.node_monitors.DiskSpaceMonitor']
                  if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('path')) {
                    workingDirectory = diskSpaceMonitor.path
                  }
                  let size = undefined
                  if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('size')) {
                    size = diskSpaceMonitor.size
                  }
                  if (size) {
                    remainingDiskSpace = (size / 1024.0 / 1024.0 / 1024.0).toFixed(2) + ' GB'
                  }
                  const responseTimeMonitor = computers[i].monitorData['hudson.node_monitors.ResponseTimeMonitor']
                  if (responseTimeMonitor && responseTimeMonitor.hasOwnProperty('average')) {
                    responseTime = responseTimeMonitor.average + 'ms'
                  }
                }
                const diskSpaceThreshold = result[url]['monitoredNodes'][displayName]['diskSpaceThreshold']
                NodeService.checkDiskSpace(url, displayName, remainingDiskSpace, diskSpaceThreshold, offline)

                result[url]['monitoredNodes'][displayName] = {
                  displayName,
                  nodeUrl,
                  workingDirectory,
                  remainingDiskSpace,
                  responseTime,
                  monitoring: true,
                  diskSpaceThreshold,
                  offline
                }
                result[url].status = 'ok'
                StorageService.saveNodeStatus(result).then(() => {
                })
              }
            }).catch((e: Error) => {
              console.error('获取数据失败', e)
              result[url].status = 'error'
              StorageService.saveNodeStatus(result).then(() => {
              })
            })
          })
        })(jenkinsUrl)
      }
    })
  }

  private static checkDiskSpace(jenkinsUrl: string, displayName: string, remainingDiskSpace: string, diskSpaceThreshold: number, offline: boolean) {
    let message = ''
    if (offline) {
      message = browser.i18n.getMessage('nodeOfflineNotifications')
    } else if (remainingDiskSpace === 'N/A') {
      message = browser.i18n.getMessage('fetchNodeInfoFailedNotifications')
    } else {
      const remainingDiskSpaceInt = parseInt(remainingDiskSpace.replace('GB', '').trim())
      if (remainingDiskSpaceInt <= diskSpaceThreshold) {
        message = browser.i18n.getMessage('insufficientDiskSpaceNotifications', [remainingDiskSpace])
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
      }).then((notificationId) => {
        console.log('checkDiskSpace notifications', notificationId)
      })
    }
  }

}
