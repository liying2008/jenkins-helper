import { StorageChangeWrapper, StorageService } from '@/libs/storage'
import { Tools } from '@/libs/tools'
import { Enc } from '@/models/common'
import { JenkinsNode } from '@/models/jenkins/node'
import { Nodes } from '@/models/node'
import { Options } from '@/models/option'

export class NodeService {
  private static lastInterval: number | undefined = undefined;
  // 请求 /api/json 使用的 tree 参数
  private static readonly TREE_PARAMS = 'computer[displayName,offline,monitorData[*]]'


  static start() {
    // 开启浏览器后先执行一遍
    NodeService.queryNodeStatus()
    StorageService.addStorageListener(NodeService.storageChange)
    StorageService.getOptions().then((options: Options) => {
      NodeService.refreshNodeStatus(options.nodeRefreshTime)
    })
  }

  private static refreshNodeStatus(refreshTime: string) {
    if (NodeService.lastInterval !== undefined) {
      window.clearInterval(NodeService.lastInterval)
    }
    NodeService.lastInterval = window.setInterval(() => {
      NodeService.queryNodeStatus()
    }, Number(refreshTime) * 3600 * 1000) /* hour to millisecond */
  }

  private static storageChange(changes: StorageChangeWrapper) {
    // console.log('storageChange::', changes)
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      const newOptions = changes[StorageService.keyForOptions].newValue
      const oldOptions = changes[StorageService.keyForOptions].oldValue
      const newRefreshTime = newOptions.nodeRefreshTime
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.nodeRefreshTime) {
        // console.log('refreshNodeStatus', newRefreshTime)
        NodeService.refreshNodeStatus(newRefreshTime)
      }
    }
  }

  static queryNodeStatus() {
    // console.log('NodeService::queryNodeStatus', 'queryNodeStatus')
    StorageService.getNodeStatus().then((result: Nodes) => {
      // 需要查询的节点所在Jenkins
      const jenkinsUrls: string[] = []
      for (const jenkinsUrl in result) {
        // console.log('node', result[jenkinsUrl])
        if (!result.hasOwnProperty(jenkinsUrl)) {
          continue
        }
        if (!result[jenkinsUrl].hasOwnProperty('monitoredNodes')) {
          // 没有监控节点
          continue
        }
        jenkinsUrls.push(jenkinsUrl)
      }

      const allFetchDataPromises: Promise<Enc>[] = []

      jenkinsUrls.forEach((url: string) => {
        allFetchDataPromises.push(Tools.fetchJenkinsDataByUrl(url, 'computer/api/json', NodeService.TREE_PARAMS))
      })

      Promise.all(allFetchDataPromises).then((values: Enc<JenkinsNode>[]) => {
        // console.log('queryNodeStatus:values', values)
        values.forEach((value: Enc<JenkinsNode>) => {
          if (value.ok) {
            const data = value.body!
            const url = value.url
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
              result[url].error = undefined
            }
          } else {
            const errMsg = value.errMsg
            const url = value.url
            console.log('获取数据失败', errMsg)
            result[url].status = 'error'
            result[url].error = errMsg || 'Unreachable'
          }
        })
        // 存储节点状态
        StorageService.saveNodeStatus(result).then(() => {
          // no op
        })
      }).catch((e: Error) => {
        // 原则上不应该走到这里
        console.log('queryNodeStatus:e', e)
      })
    })
  }

  private static checkDiskSpace(jenkinsUrl: string, displayName: string, remainingDiskSpace: string, diskSpaceThreshold: number, offline: boolean) {
    let message = ''
    if (offline) {
      message = browser.i18n.getMessage('nodeOfflineNotifications')
    } else if (remainingDiskSpace === 'N/A') {
      message = browser.i18n.getMessage('fetchNodeInfoFailedNotifications')
    } else {
      const remainingDiskSpaceInt = parseFloat(remainingDiskSpace.replace('GB', '').trim())
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
