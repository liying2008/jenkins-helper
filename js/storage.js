var StorageService = (function () {
  function saveJenkinsUrls(jenkinsUrls, callback) {
    chrome.storage.local.set({'jenkins-url': jenkinsUrls}, callback);
  }

  function getJenkinsUrls(callback) {
    chrome.storage.local.get('jenkins-url', function (result) {
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
    chrome.storage.local.set(jenkinsObj, callback);
  }

  function removeJobStatus(jenkinsUrl, callback) {
    chrome.storage.local.remove(jenkinsUrl, callback);
  }


  function getJobStatus(jenkinsUrl, callback) {
    chrome.storage.local.get(jenkinsUrl, function (result) {
      callback(result || {})
    });
  }

  function saveNodeStatus(nodesStatus, callback) {
    chrome.storage.local.set({'nodes': nodesStatus}, callback);
  }

  function getNodeStatus(callback) {
    chrome.storage.local.get('nodes', function (result) {
      callback(result['nodes'] || {})
    });
  }

  function addStorageListener(listener) {
    chrome.storage.onChanged.addListener(listener);
  }

  function getOptions(callback) {
    chrome.storage.local.get('options', function (result) {
      callback(result['options'] || {
        defaultTab: 'monitor',
        refreshTime: 60,
        showNotificationOption: 'all',
        omniboxJenkinsUrl: '',
        nodeParam: '',
        jobStatsJenkinsUrl: '',
      })
    })
  }

  function saveOptions(options, callback) {
    chrome.storage.local.set({'options': options}, callback)
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