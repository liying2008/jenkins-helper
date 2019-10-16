var JobServices = (function () {
  "use strict";

  var jenkinsUrls = [];
  var lastInterval = undefined;
  var showNotificationOption = undefined;
  // 失败Job数量
  var failureJobCount = 0;
  // 不稳定Job数量
  var unstableJobCount = 0;
  // 成功Job数量
  var successJobCount = 0;
  // 是否Jenkins URL无法访问
  var errorOnFetch = false;

  var status = Tools.jobStatus;
  var labelClass = Tools.labelClass;

  // 通知ID和URL的对照
  var notificationUrlMap = {};

  function start() {
    status = Tools.jobStatus;
    labelClass = Tools.labelClass;

    StorageService.addStorageListener(storageChange);
    StorageService.getJenkinsUrls(function (result) {
      jenkinsUrls = result;
      StorageService.getOptions(function (options) {
        showNotificationOption = options.showNotificationOption;
        refreshJobStatus(options.refreshTime || 60)
      })
    });
    // 点击通知
    browser.notifications.onClicked.addListener(function (notificationId) {
      // 打开构建页面
      if (notificationId in notificationUrlMap) {
        browser.tabs.create({'url': notificationUrlMap[notificationId]});
      }
    })
  }

  function refreshJobStatus(refreshTime) {
    if (lastInterval !== undefined) {
      window.clearInterval(lastInterval)
    }
    lastInterval = window.setInterval("JobServices.queryJobStatus()", refreshTime * 1000)
  }

  function storageChange(changes) {
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      console.log('changes', changes);
      var oldOptions = changes[StorageService.keyForOptions].oldValue;
      var newOptions = changes[StorageService.keyForOptions].newValue;
      showNotificationOption = newOptions.showNotificationOption;
      var newRefreshTime = newOptions.refreshTime;
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.refreshTime) {
        refreshJobStatus(newRefreshTime)
      }
      var newOmniboxJenkinsUrl = newOptions.omniboxJenkinsUrl;
      // omniboxJenkinsUrl 变更
      if (oldOptions === undefined || newOmniboxJenkinsUrl !== oldOptions.omniboxJenkinsUrl) {
        Omnibox.getAllJobs();
      }
    } else if (StorageService.keyForJenkinsUrl in changes) {
      // Jenkins Url 改变
      console.log('changes', changes);
      jenkinsUrls = changes[StorageService.keyForJenkinsUrl].newValue;
      queryJobStatus()
    }
  }

  function resetBadgeJobCount() {
    failureJobCount = 0;
    unstableJobCount = 0;
    successJobCount = 0;
    errorOnFetch = false;
  }

  function countBadgeJobCount(color) {
    if (color === 'blue') successJobCount++;
    else if (color === 'red') failureJobCount++;
    else if (color === 'yellow') unstableJobCount++;
    else if (color === undefined) errorOnFetch = true;
  }

  function queryJobStatus() {
    // console.log('jenkinsUrls', jenkinsUrls);
    resetBadgeJobCount();
    if (jenkinsUrls.length === 0) {
      changeBadge();
    }
    for (var jenkinsIndex = 0; jenkinsIndex < jenkinsUrls.length; jenkinsIndex++) {
      var url = jenkinsUrls[jenkinsIndex];


      (function (url) {
        StorageService.getJobStatus(url, function (result) {
          // console.log('queryJobStatus::result', result);
          var encodeParam = encodeURI('*,lastCompletedBuild[number,result,timestamp,url],jobs[name,displayName,url,color,lastCompletedBuild[number,result,timestamp,url]]');
          var jsonUrl = url + 'api/json?tree=' + encodeParam;
          // console.log('queryJobStatus jsonUrl', jsonUrl);
          Tools.getFetchOption(jsonUrl, function (header) {
            fetch(jsonUrl, header).then(function (res) {
              if (res.ok) {
                return res.json();
              } else {
                return Promise.reject(res);
              }
            }).then(function (data) {
              if (data.hasOwnProperty('jobs')) {
                // Jenkins or view data
                parseJenkinsOrViewData(url, data, result || {})
              } else {
                // Single job data
                parseSingleJobData(url, data, result || {})
              }
            }).catch(function (e) {
              console.error("queryJobStatus: 获取Job状态失败", e);
              var jenkinsObj = {};
              jenkinsObj.name = url;
              jenkinsObj.status = 'error';
              jenkinsObj.error = e.message || 'Unreachable';
              console.log(jenkinsObj);
              countBadgeJobCount();
              changeBadge();
              StorageService.saveJobStatus(url, jenkinsObj, function () {
                console.log('saveJobStatus error ok')
              })
            });
          })
        });
      })(url)
    }
  }

  function parseJenkinsOrViewData(url, data, oldStatus) {
    var jobs = data.jobs;
    // console.log('jobs 1', jobs);
    for (var i = 0; i < jobs.length; i++) {
      jobs[i].lastBuildNumber = 0;
      jobs[i].lastBuildTimestamp = 0;
      jobs[i].lastBuildUrl = '';
      jobs[i].lastBuildResult = '';
      if (jobs[i].lastCompletedBuild !== undefined && jobs[i].lastCompletedBuild !== null) {
        jobs[i].lastBuildNumber = jobs[i].lastCompletedBuild.number;
        jobs[i].lastBuildTimestamp = jobs[i].lastCompletedBuild.timestamp;
        jobs[i].lastBuildUrl = jobs[i].lastCompletedBuild.url;
        jobs[i].lastBuildResult = jobs[i].lastCompletedBuild.result;
      }
    }
    var jenkinsObj = {};
    jenkinsObj.name = data.displayName || data.name || 'All Jobs';
    jenkinsObj.status = 'ok';
    jenkinsObj.jobs = {};
    for (var jobIndex = 0; jobIndex < jobs.length; jobIndex++) {
      var job = jobs[jobIndex];
      var jobColor = job.color;
      if (jobColor === undefined) continue;
      var building = false;
      if (jobColor.endsWith('_anime')) {
        // 正在构建中
        building = true;
        jobColor = jobColor.replace(/_anime$/, '');
      }
      countBadgeJobCount(jobColor);
      var buildStatus = status[jobColor];

      if (oldStatus[url] && oldStatus[url].jobs) {
        oldStatus = oldStatus[url].jobs
      }
      if (oldStatus[job.url] && job.lastBuildNumber > oldStatus[job.url].lastBuildNumber) {
        // 新的一次构建
        showNotification(job.lastBuildResult, job.displayName, job.lastBuildUrl);
      }

      jenkinsObj.jobs[job.url] = {
        name: job.displayName,
        color: jobColor,
        status: buildStatus,
        building: building,
        labelClass: labelClass[jobColor],
        lastBuildNumber: job.lastBuildNumber,
        lastBuildTimestamp: job.lastBuildTimestamp,
      }
    } // end for
    changeBadge();
    // console.log(jenkinsObj);
    StorageService.saveJobStatus(url, jenkinsObj, function () {
      console.log('saveJobStatus ok')
    })
  }

  function parseSingleJobData(url, data, oldStatus) {
    var jenkinsObj = {};
    jenkinsObj.name = data.displayName || data.name || data.fullName;
    jenkinsObj.status = 'ok';
    jenkinsObj.jobs = {};
    var jobColor = data.color;
    var building = false;
    if (jobColor.endsWith('_anime')) {
      // 正在构建中
      building = true;
      jobColor = jobColor.replace(/_anime$/, '');
    }
    countBadgeJobCount(jobColor);
    var buildStatus = status[jobColor];
    var lastBuild = data.lastCompletedBuild || {};
    var lastBuildNumber = lastBuild.number || 0;
    var lastBuildTimestamp = lastBuild.timestamp || 0;
    var lastBuildUrl = lastBuild.url || '';
    var lastBuildResult = lastBuild.result || '';

    if (oldStatus[url] && oldStatus[url].jobs) {
      oldStatus = oldStatus[url].jobs
    }
    if (oldStatus[data.url] && lastBuildNumber > oldStatus[data.url].lastBuildNumber) {
      // 新的一次构建
      showNotification(lastBuildResult, jenkinsObj.displayName, lastBuildUrl);
    }
    jenkinsObj.jobs[data.url] = {
      name: data.displayName,
      color: jobColor,
      status: buildStatus,
      building: building,
      labelClass: labelClass[jobColor],
      lastBuildNumber: lastBuildNumber,
      lastBuildTimestamp: lastBuildTimestamp,
    };

    changeBadge();
    // console.log(jenkinsObj);
    StorageService.saveJobStatus(url, jenkinsObj, function () {
      console.log('saveJobStatus ok')
    })
  }

  function changeBadge() {
    var _failureJobCount = failureJobCount;
    var _unstableJobCount = unstableJobCount;
    var _successJobCount = successJobCount;

    if (errorOnFetch) {
      browser.browserAction.setBadgeText({text: 'ERR'});
      browser.browserAction.setBadgeBackgroundColor({color: '#df2b38'});
    } else {
      if (_failureJobCount === 0 && _unstableJobCount === 0 && _successJobCount === 0) {
        browser.browserAction.setBadgeText({text: ''});
      } else {
        var count = _failureJobCount || _unstableJobCount || _successJobCount || 0;
        var color = _failureJobCount ? '#c9302c' : _unstableJobCount ? '#f0ad4e' : '#5cb85c';
        if (count > 9999) {
          browser.browserAction.setBadgeText({text: '999+'});
        } else {
          browser.browserAction.setBadgeText({text: count.toString()});
        }
        browser.browserAction.setBadgeBackgroundColor({color: color});
      }
    }
  }

  // 显示通知
  function showNotification(result, jobName, url) {
    if (showNotificationOption === 'all') {
      show(result, jobName, url);
    } else if (showNotificationOption === 'unstable') {
      if (result !== 'SUCCESS') {
        show(result, jobName, url);
      }
    }
  }


  function show(result, jobName, url) {
    var statusIcon = 'gray';
    if (result === 'SUCCESS') statusIcon = 'green';
    else if (result === 'FAILURE') statusIcon = 'red';
    else if (result === 'UNSTABLE') statusIcon = 'yellow';

    browser.notifications.create(null, {
      type: 'basic',
      iconUrl: 'img/logo-' + statusIcon + '.svg',
      title: 'Build ' + result + ' ! - ' + jobName,
      message: decodeURIComponent(url),
      priority: 0,  // Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is default
    }).then(function (notificationId) {
      notificationUrlMap[notificationId] = url
    });
  }

  return {
    start,
    queryJobStatus,
  }
})();
