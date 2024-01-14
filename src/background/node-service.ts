import type { Alarms } from 'webextension-polyfill'
import { t } from '~/libs/extension'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import type { Enc } from '~/models/common'
import type { Options } from '~/models/option'

export class NodeService {
  private static instance?: NodeService
  // alarm name
  private static readonly ALARM_NAME = 'node-service-alarm'
  // 请求 /api/json 使用的 tree 参数
  private static readonly TREE_PARAMS = 'computer[displayName,offline,monitorData[*]]'

  static getInstance() {
    if (!NodeService.instance) {
      NodeService.instance = new NodeService()
    }
    return NodeService.instance
  }

  static launch() {
    NodeService.getInstance().start()
  }

  private start() {
    StorageService.addStorageListener(this.storageChange)
    // 监听 Alarm
    if (!browser.alarms.onAlarm.hasListener(this.onAlarm)) {
      browser.alarms.onAlarm.addListener(this.onAlarm)
    }

    StorageService.getOptions().then((options: Options) => {
      // console.log('node-service::options', options)
      this.refreshNodeStatus(options.nodeRefreshTime)
    })
  }

  private async refreshNodeStatus(refreshTime: string) {
    console.log('refreshNodeStatus::refresh time', refreshTime)
    try {
      const alarm = await browser.alarms.get(NodeService.ALARM_NAME)
      if (!alarm) {
        console.log('node-service::create alarm.')
        this.createAlarm(refreshTime)
      } else {
        const isEqual = Tools.isAlarmEqual(alarm, {
          name: NodeService.ALARM_NAME,
          periodInMinutes: this.getPeriodInMinutes(refreshTime),
        } as Alarms.Alarm)
        if (!isEqual) {
          console.log('node-service::clear alarm.')
          try {
            await browser.alarms.clear(NodeService.ALARM_NAME)
            this.createAlarm(refreshTime)
          } catch (e) {
            console.error(`clear alarm ${NodeService.ALARM_NAME} error:`, e)
          }
        } else {
          // 已有 alarm，不需要重复创建
          // no op
        }
      }
    } catch (e) {
      console.error(`get alarm ${NodeService.ALARM_NAME} error:`, e)
      this.createAlarm(refreshTime)
    }
  }

  private getPeriodInMinutes(refreshTime: string) {
    // Chrome extension 性能限制，periodInMinutes 不能小于 0.5
    // Chrome 120：从 Chrome 120 开始，最小闹钟间隔时间已从 1 分钟缩短到 30 秒。若要让闹钟在 30 秒后触发，请设置 periodInMinutes: 0.5。
    // refer: https://developer.chrome.com/docs/extensions/reference/alarms/
    let periodInMinutes = Number(refreshTime) * 60 /* hour to minute */
    // TODO 开发模式支持 < 1
    // TODO 仅测试使用
    // periodInMinutes = 0.5
    if (periodInMinutes < 1) {
      periodInMinutes = 1
    }
    return periodInMinutes
  }

  private createAlarm(refreshTime: string) {
    console.log('node-service::create alarm.')
    browser.alarms.create(NodeService.ALARM_NAME, {
      periodInMinutes: this.getPeriodInMinutes(refreshTime),
    })
  }

  private onAlarm = (alarm: Alarms.Alarm) => {
    // 使用箭头函数解决 this 指向问题
    if (alarm.name === NodeService.ALARM_NAME) {
      console.log('node-service::onAlarm:', alarm)
      this.queryNodeStatus()
    }
  }

  private storageChange = (changes: StorageChangeWrapper) => {
    // 使用箭头函数解决 this 指向问题
    // console.log('storageChange::', changes)
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      const newOptions = changes[StorageService.keyForOptions].newValue
      const oldOptions = changes[StorageService.keyForOptions].oldValue
      const newRefreshTime = newOptions.nodeRefreshTime
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.nodeRefreshTime) {
        // console.log('refreshNodeStatus', newRefreshTime)
        this.refreshNodeStatus(newRefreshTime)
      }
    }
  }

  async queryNodeStatus() {
    // console.log('NodeService::queryNodeStatus', 'queryNodeStatus')
    try {
      const result = await StorageService.getNodeStatus()
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

      try {
        const values = await Promise.all(allFetchDataPromises)
        // console.log('queryNodeStatus:values', values)
        for (const value of values) {
          if (value.ok) {
            const data = value.body!
            const url = value.url
            // console.log('queryNodeStatus::data', data)
            const computers = data.computer
            for (let i = 0; i < computers.length; i++) {
              const displayName = computers[i].displayName
              if (!result[url].monitoredNodes.hasOwnProperty(displayName)) {
                continue
              }
              let nodeUrl = `${url}computer/${displayName}/`
              if (displayName === 'master') {
                nodeUrl = `${url}computer/(master)/`
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
                let size
                if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('size')) {
                  size = diskSpaceMonitor.size
                }
                if (size) {
                  remainingDiskSpace = `${(size / 1024.0 / 1024.0 / 1024.0).toFixed(2)} GB`
                }
                const responseTimeMonitor = computers[i].monitorData['hudson.node_monitors.ResponseTimeMonitor']
                if (responseTimeMonitor && responseTimeMonitor.hasOwnProperty('average')) {
                  responseTime = `${responseTimeMonitor.average}ms`
                }
              }
              const diskSpaceThreshold = result[url].monitoredNodes[displayName].diskSpaceThreshold
              await this.checkDiskSpace(url, displayName, remainingDiskSpace, diskSpaceThreshold, offline)

              result[url].monitoredNodes[displayName] = {
                displayName,
                nodeUrl,
                workingDirectory,
                remainingDiskSpace,
                responseTime,
                monitoring: true,
                diskSpaceThreshold,
                offline,
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
        }
        // 存储节点状态
        await StorageService.saveNodeStatus(result)
      } catch (e) {
        // 原则上不应该走到这里
        console.error('queryNodeStatus:e', e)
      }
    } catch (e) {
      // 原则上不应该走到这里
      console.error('queryNodeStatus:e', e)
    }
  }

  private async checkDiskSpace(jenkinsUrl: string, displayName: string, remainingDiskSpace: string, diskSpaceThreshold: number, offline: boolean) {
    let message = ''
    if (offline) {
      message = t('nodeOfflineNotifications')
    } else if (remainingDiskSpace === 'N/A') {
      message = t('fetchNodeInfoFailedNotifications')
    } else {
      const remainingDiskSpaceInt = Number.parseFloat(remainingDiskSpace.replace('GB', '').trim())
      if (remainingDiskSpaceInt <= diskSpaceThreshold) {
        message = t('insufficientDiskSpaceNotifications', [remainingDiskSpace])
      }
    }

    if (message) {
      // 显示通知
      try {
        const notificationId = await browser.notifications.create({
          type: 'basic',
          iconUrl: 'img/computer48.png',
          title: displayName,
          message,
          priority: 2,
        })
        console.log('checkDiskSpace notifications', notificationId)
      } catch (e) {
        console.error('checkDiskSpace notifications error', e)
      }
    }
  }
}
