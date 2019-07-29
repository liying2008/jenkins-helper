/*
 * storage apis
 * https://developer.chrome.com/apps/storage#property-local
 */
var StorageService = (function () {
  function saveJenkinsUrls(jenkinsUrls, callback) {
    browser.storage.local.set({'jenkins-url': JSON.parse(JSON.stringify(jenkinsUrls))}).then(callback);
  }

  function getJenkinsUrls(callback) {
    browser.storage.local.get('jenkins-url').then(function (result) {
      callback(result['jenkins-url'] || [])
    });
  }

  // 删除一个Jenkins Url
  function removeJenkinsUrls(jenkinsUrl, callback) {
    getJenkinsUrls(function (result) {
      if (result !== undefined) {
        var index = result.indexOf(jenkinsUrl);
        if (index > -1) {
          result.splice(index, 1);
          saveJenkinsUrls(result, function () {
            removeJobStatus(jenkinsUrl, callback)
          })
        }
      }
    })
  }

  function saveJobStatus(jenkinsUrl, info, callback) {
    var jenkinsObj = {};
    jenkinsObj[jenkinsUrl] = info;
    browser.storage.local.set(jenkinsObj).then(callback);
  }

  function removeJobStatus(jenkinsUrl, callback) {
    browser.storage.local.remove(jenkinsUrl).then(callback);
  }


  function getJobStatus(jenkinsUrl, callback) {
    browser.storage.local.get(jenkinsUrl).then(function (result) {
      callback(result || {})
    });
  }

  function saveNodeStatus(nodesStatus, callback) {
    browser.storage.local.set({'nodes': JSON.parse(JSON.stringify(nodesStatus))}).then(callback);
  }

  function getNodeStatus(callback) {
    browser.storage.local.get('nodes').then(function (result) {
      callback(result['nodes'] || {})
    });
  }

  function addStorageListener(listener) {
    browser.storage.onChanged.addListener(listener);
  }

  function getOptions(callback) {
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

  function saveOptions(options, callback) {
    browser.storage.local.set({'options': JSON.parse(JSON.stringify(options))}).then(callback)
  }

  return {
    keyForJenkinsUrl: 'jenkins-url',
    keyForOptions: 'options',
    keyForNodes: 'nodes',
    saveJenkinsUrls,
    getJenkinsUrls,
    removeJenkinsUrls,
    saveJobStatus,
    getJobStatus,
    getOptions,
    saveOptions,
    saveNodeStatus,
    getNodeStatus,
    addStorageListener,
  }
})();
