var Services = (function () {
  "use strict";

  var jenkinsUrls = [];
  var lastInterval = undefined;
  var showNotificationOption = undefined;
  var failureJobCount = 0;
  var unstableJobCount = 0;
  var successJobCount = 0;
  var xmlParser;
  var fetchOptions = {
    credentials: 'include'
  };
  var status = {
    blue: 'Success',
    yellow: 'Unstable',
    red: 'Failure',
    aborted: 'Aborted',
    notbuilt: 'Not built',
    disabled: 'Disabled',
  };

  // no use
  var labelClass = {
    blue: 'label-success',
    yellow: 'label-warning',
    red: 'label-danger',
    aborted: 'label-default',
    notbuilt: 'label-primary',
    disabled: 'label-primary',
  };

  function start() {
    xmlParser = new DOMParser();
    StorageService.addStorageListener(storageChange);
    StorageService.getJenkinsUrls(function (result) {
      jenkinsUrls = result;
      StorageService.getOptions(function (options) {
        showNotificationOption = options.showNotificationOption;
        refreshJobStatus(options.refreshTime)
      })
    });
  }

  function refreshJobStatus(refreshTime) {
    if (lastInterval !== undefined) {
      window.clearInterval(lastInterval)
    }
    lastInterval = window.setInterval("Services.queryJobStatus()", refreshTime * 1000)
  }

  function storageChange(changes) {
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      console.log('changes', changes);
      showNotificationOption = changes[StorageService.keyForOptions].newValue.showNotificationOption;
      var newRefreshTime = changes[StorageService.keyForOptions].newValue.refreshTime;
      // refreshTime 变更
      if (changes[StorageService.keyForOptions].oldValue === undefined
        || newRefreshTime !== changes[StorageService.keyForOptions].oldValue.refreshTime) {
        refreshJobStatus(newRefreshTime)
      }
      var newOmniboxJenkinsUrl = changes[StorageService.keyForOptions].newValue.omniboxJenkinsUrl;
      // omniboxJenkinsUrl 变更
      if (changes[StorageService.keyForOptions].oldValue === undefined
        || newOmniboxJenkinsUrl !== changes[StorageService.keyForOptions].oldValue.omniboxJenkinsUrl) {
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
  }

  function countBadgeJobCount(color) {
    if (color === 'blue') successJobCount++;
    if (color === 'red') failureJobCount++;
    if (color === 'yellow') unstableJobCount++;
  }

  function queryJobStatus() {
    // console.log('jenkinsUrls', jenkinsUrls);
    resetBadgeJobCount();
    for (var jenkinsIndex = 0; jenkinsIndex < jenkinsUrls.length; jenkinsIndex++) {
      var url = jenkinsUrls[jenkinsIndex];


      (function (url) {
        StorageService.getJobStatus(url, function (result) {
          var jsonUrl = url + 'api/json/';
          fetch(jsonUrl, fetchOptions).then(function (res) {
            if (res.ok) {
              return res.json();
            } else {
              return Promise.reject(res);
            }
          }).then(function (data) {
            if (result.hasOwnProperty(url)) {
              parseJobData(url, data, result[url].jobs || {});
            } else {
              parseJobData(url, data, {});
            }
          }).catch(function (e) {
            console.error("Oops, error", e);
            var jenkinsObj = {};
            jenkinsObj.name = url;
            jenkinsObj.status = 'error';
            jenkinsObj.error = e.message || 'Unreachable';
            console.log(jenkinsObj);
            StorageService.saveJobStatus(url, jenkinsObj, function () {
              console.log('saveJobStatus error ok')
            })
          });
        });
      })(url)
    }
  }

  function parseJobData(url, data, oldStatus) {
    // console.log('data', data);
    if (data.hasOwnProperty('jobs')) {
      // Jenkins Url 或 View Url
      parseJenkinsOrViewData(url, data, oldStatus)
    } else {
      // Job Url
      parseSingleJobData(url, data, oldStatus)
    }
  }

  function parseJenkinsOrViewData(url, data, oldStatus) {
    fetch(url + 'cc.xml', fetchOptions).then(function (res) {
      return res.ok ? res.text() : Promise.reject(res);
    }).then(function (text) {
      var projects = xmlParser.parseFromString(text, 'text/xml').getElementsByTagName('Project');
      var jobExtraInfo = {};
      for (var i = 0; i < projects.length; i++) {
        var lastBuildNumber = parseInt(projects[i].attributes['lastBuildLabel'].value);
        var name = projects[i].attributes['name'].value;
        var lastBuildUrl = projects[i].attributes['webUrl'].value + lastBuildNumber + '/';
        jobExtraInfo[name] = {
          lastBuildNumber: lastBuildNumber,
          lastBuildUrl: lastBuildUrl,
        }
      }
      var jenkinsObj = {};
      jenkinsObj.name = data.name || 'All Jobs';
      jenkinsObj.status = 'ok';
      var jobs = data.jobs;
      jenkinsObj.jobs = {};
      for (var jobIndex = 0; jobIndex < jobs.length; jobIndex++) {
        var job = jobs[jobIndex];
        var jobColor = job.color;
        var building = false;
        if (jobColor.endsWith('_anime')) {
          // 正在构建中
          building = true;
          jobColor = jobColor.replace(/_anime$/, '');
        }
        countBadgeJobCount(jobColor);
        var buildStatus = status[jobColor];
        if (oldStatus[job.url] && job.name in jobExtraInfo
          && jobExtraInfo[job.name].lastBuildNumber > oldStatus[job.url].lastBuildNumber) {
          // 新的一次构建
          showNotification(jobColor, job.name, jobExtraInfo[job.name].lastBuildUrl);
        }

        jenkinsObj.jobs[job.url] = {
          name: job.name,
          color: jobColor,
          status: buildStatus,
          building: building,
          labelClass: labelClass[jobColor],
          lastBuildNumber: job.name in jobExtraInfo ? jobExtraInfo[job.name].lastBuildNumber : 0,
        }
      }
      changeBadge();
      // console.log(jenkinsObj);
      StorageService.saveJobStatus(url, jenkinsObj, function () {
        console.log('saveJobStatus ok')
      })
    })
  }

  function parseSingleJobData(url, data, oldStatus) {
    var jenkinsObj = {};
    jenkinsObj.name = data.name || data.displayName || data.fullName;
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
    var lastBuildUrl = lastBuild.url || '';
    if (oldStatus[data.url] && lastBuildNumber > oldStatus[data.url].lastBuildNumber) {
      // 新的一次构建
      showNotification(jobColor, jenkinsObj.name, lastBuildUrl);
    }
    jenkinsObj.jobs[data.url] = {
      name: data.name,
      color: jobColor,
      status: buildStatus,
      building: building,
      labelClass: labelClass[jobColor],
      lastBuildNumber: lastBuildNumber,
    };

    changeBadge();
    // console.log(jenkinsObj);
    StorageService.saveJobStatus(url, jenkinsObj, function () {
      console.log('saveJobStatus ok')
    })
  }

  function changeBadge() {
    var count = failureJobCount || unstableJobCount || successJobCount || 0;
    var color = failureJobCount ? '#c9302c' : unstableJobCount ? '#f0ad4e' : '#5cb85c';
    chrome.browserAction.setBadgeText({text: count.toString()});
    chrome.browserAction.setBadgeBackgroundColor({color: color});
  }

  // 显示通知
  function showNotification(color, jobName, url) {
    if (showNotificationOption === 'all') {
      show();
    } else if (showNotificationOption === 'unstable') {
      if (color !== 'blue') {
        show();
      }
    }

    function show() {
      var statusIcon = color;
      if (color === 'blue') statusIcon = 'green';
      if (color === 'aborted') statusIcon = 'gray';
      chrome.notifications.create(null, {
        type: 'basic',
        iconUrl: 'img/logo-' + statusIcon + '.svg',
        title: 'Build ' + status[color] + '! - ' + jobName,
        message: url,
      }, function (notificationId) {
        // no op
      });
      chrome.notifications.onClicked.addListener(function (notificationId) {
        // 打开构建页面
        chrome.tabs.create({'url': url});
      })
    }
  }

  return {
    start,
    queryJobStatus,
  }
})();
