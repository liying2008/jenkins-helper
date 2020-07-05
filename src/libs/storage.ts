/*
 * storage apis
 * https://developer.chrome.com/apps/storage#property-local
 */
import {JobRoot, JobSet} from "@/models/job";
import {JenkinsUrlRoot} from "@/models/jenkins-url";
import {Nodes} from "@/models/node";
import {Options} from "@/models/option";

export class StorageService {
  static readonly keyForJenkinsUrl = 'jenkins-url'
  static readonly keyForOptions = 'options'
  static readonly keyForNodes = 'nodes'

  static saveJenkinsUrls(jenkinsUrls: string[], callback: any) {
    const jenkinsUrlRoot: JenkinsUrlRoot = {'jenkins-url': JSON.parse(JSON.stringify(jenkinsUrls))}
    browser.storage.local.set(jenkinsUrlRoot).then(callback);
  }

  static getJenkinsUrls(callback: any) {
    browser.storage.local.get('jenkins-url').then(function (result) {
      callback(result['jenkins-url'] || [])
    });
  }

  // 删除一个Jenkins Url
  static removeJenkinsUrls(jenkinsUrl: string, callback: any) {
    StorageService.getJenkinsUrls(function (result: any) {
      if (result !== undefined) {
        var index = result.indexOf(jenkinsUrl);
        if (index > -1) {
          result.splice(index, 1);
          StorageService.saveJenkinsUrls(result, function () {
            StorageService.removeJobStatus(jenkinsUrl, callback)
          })
        }
      }
    })
  }

  static saveJobStatus(jenkinsUrl: string, info: JobSet, callback: any) {
    const jenkinsObj: JobRoot = {};
    jenkinsObj[jenkinsUrl] = info;
    browser.storage.local.set(jenkinsObj).then(callback);
  }

  static removeJobStatus(jenkinsUrl: string, callback: any) {
    browser.storage.local.remove(jenkinsUrl).then(callback);
  }

  static getJobStatus(jenkinsUrl: string, callback: any) {
    browser.storage.local.get(jenkinsUrl).then(function (result) {
      callback(result || {})
    });
  }

  static saveNodeStatus(nodesStatus: Nodes, callback: any) {
    browser.storage.local.set({'nodes': JSON.parse(JSON.stringify(nodesStatus))}).then(callback);
  }

  static getNodeStatus(callback: any) {
    browser.storage.local.get('nodes').then(function (result) {
      callback(result['nodes'] || {})
    });
  }

  static addStorageListener(listener: any) {
    browser.storage.onChanged.addListener(listener);
  }

  static getOptions(callback: any) {
    browser.storage.local.get('options').then(function (result) {
      callback(result['options'] || {
        defaultTab: 'monitor',
        jenkinsTokens: [],
        refreshTime: 60,
        nodeRefreshTime: 2,
        showNotificationOption: 'all',
        omniboxJenkinsUrl: '',
        nodeParam: '',
        jobStatsJenkinsUrl: '',
        showDisabledJobs: true,
        enableParamsStashAndRecover: true,
      })
    })
  }

  static saveOptions(options: Options, callback?: any) {
    browser.storage.local.set({'options': JSON.parse(JSON.stringify(options))}).then(callback)
  }

  static set(object: any, callback: any) {
    browser.storage.local.set(object).then(callback)
  }

  static get(keys: string[], callback: any) {
    browser.storage.local.get(keys).then(function (result) {
      callback(result || {})
    });
  }

}
