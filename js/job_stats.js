new Vue({
  el: '#app',
  data: {
    strings: {
      title: chrome.i18n.getMessage("jobStatisticsTitle"),
      jobStatisticsDataFrom_: chrome.i18n.getMessage("jobStatisticsDataFrom_"),
      jobStatisticsShowSettings_: chrome.i18n.getMessage("jobStatisticsShowSettings_"),
      jobStatisticsShowEnabledJobOnly: chrome.i18n.getMessage("jobStatisticsShowEnabledJobOnly"),
      jobStatisticsShowCronTableJobOnly: chrome.i18n.getMessage("jobStatisticsShowCronTableJobOnly"),
    },
    jenkinsUrls: [],
    // 请求数据的URL
    urls: [],
    // 请求失败的URL
    badUrls: [],
    nodeParams: [],
    jobUrlVisited: [],
    jobs: [],
    originJobs: [],
    xmlParser: undefined,
    showEnabledJobOnly: false,
    showCronTableJobOnly: false,
  },
  watch: {
    showEnabledJobOnly: function (newValue, oldValue) {
      this.updateJobsFromOrigin()
    },
    showCronTableJobOnly: function (newValue, oldValue) {
      this.updateJobsFromOrigin()
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      var _self = this;
      _self.xmlParser = new DOMParser();
      StorageService.addStorageListener(this.jobStatsChange);
      StorageService.getOptions(function (result) {
        Tools.setJenkinsTokens(result.jenkinsTokens || []);
        if (result.jobStatsJenkinsUrl.trim() !== '') {
          _self.jenkinsUrls = result.jobStatsJenkinsUrl.trim().split('\n');
        }
        if (result.nodeParam.trim() !== '') {
          _self.nodeParams = result.nodeParam.trim().split(',');
        }
        _self.getJobStats();
      })
    },
    jobStatsChange(changes) {
      if (StorageService.keyForOptions in changes) {
        // 设置改变
        var newNodeParam = changes[StorageService.keyForOptions].newValue.nodeParam;
        var newJobStatsJenkinsUrl = changes[StorageService.keyForOptions].newValue.jobStatsJenkinsUrl;
        if (changes[StorageService.keyForOptions].oldValue !== undefined
          && newNodeParam === changes[StorageService.keyForOptions].oldValue.nodeParam
          && newJobStatsJenkinsUrl === changes[StorageService.keyForOptions].oldValue.jobStatsJenkinsUrl) {
          // Job 统计相关设置没有改变
          return
        }
        // 设置改变了，重新请求数据
        if (newJobStatsJenkinsUrl.trim() !== '') {
          this.jenkinsUrls = newJobStatsJenkinsUrl.trim().split('\n');
        } else {
          this.jenkinsUrls = []
        }
        if (newNodeParam.trim() !== '') {
          this.nodeParams = newNodeParam.trim().split(',');
        } else {
          this.nodeParams = []
        }

        this.getJobStats();
      }
    },
    updateJobsFromOrigin() {
      this.jobs = [];
      var jobLen = this.originJobs.length;
      for (var i = 0; i < jobLen; i++) {
        var job = this.originJobs[i];
        if (this.showEnabledJobOnly && job.disabled === 'true') continue;
        if (this.showCronTableJobOnly && this.isCronTableComment(job.timerTrigger)) continue;
        this.jobs.push(job);
      }
    },
    // 判断一个crontable是否被注释掉了，需要判断是否每行都被注释了
    isCronTableComment(cronTableStr) {
      if (!cronTableStr) return true;
      var comment = true;
      cronTableStr = cronTableStr.trim();
      var cronTables = cronTableStr.split("\n");
      for (var i = 0; i < cronTables.length; i++) {
        if (cronTables[i].trim().indexOf('#') !== 0) {
          comment = false;
          break
        }
      }
      return comment
    },
    getJobStats() {
      var _self = this;
      _self.urls = [];
      _self.badUrls = [];
      _self.jobs = [];
      _self.jobUrlVisited = [];
      var urlLen = _self.jenkinsUrls.length;
      for (var i = 0; i < urlLen; i++) {
        var url = _self.jenkinsUrls[i].trim();
        if (url === '') {
          continue
        }
        url = url.charAt(url.length - 1) === '/' ? url.substring(0, url.length - 1) : url;
        _self.urls.push(url);

        (function (url) {
          var encodeParam = encodeURI('url,jobs[url]');
          var jsonUrl = url + '/api/json?tree=' + encodeParam;
          fetch(jsonUrl, Tools.getFetchOption(jsonUrl)).then(function (res) {
            if (res.ok) {
              return res.json();
            } else {
              return Promise.reject(res);
            }
          }).then(function (data) {
            if (data.hasOwnProperty('jobs')) {
              var jobLen = data.jobs.length;
              for (var jobIndex = 0; jobIndex < jobLen; jobIndex++) {
                _self.getJobStatsByUrl(data.jobs[jobIndex].url)
              }
            } else {
              // Job Url
              _self.getJobStatsByUrl(data.url)
            }
          }).catch(function (e) {
            console.error("获取Job URL失败", url, e);
            _self.badUrls.push(url)
          });
        })(url)
      }
    },

    getJobStatsByUrl(url) {
      var _self = this;
      if (_self.jobUrlVisited.indexOf(url) >= 0) {
        return
      } else {
        _self.jobUrlVisited.push(url)
      }
      fetch(url + 'config.xml', Tools.getFetchOption(url + 'config.xml')).then(function (res) {
        return res.ok ? res.text() : Promise.reject(res);
      }).then(function (text) {
        var documentNode = _self.xmlParser.parseFromString(text, 'text/xml');
        var projectNodes = documentNode.getElementsByTagName('project');

        var job;
        if (projectNodes.length > 0) {
          // 自由风格项目
          job = _self.parseFreeStyleJobFromXml(projectNodes[0])
        } else {
          var flowNodes = documentNode.getElementsByTagName('flow-definition');
          if (flowNodes.length > 0) {
            // 流水线项目
            job = _self.parsePipelineJobFromXml(flowNodes[0])
          } else {
            // 其他项目
            // todo
          }
        }
        // console.log('job', job)
        if (job) {
          job.url = decodeURIComponent(url);
          _self.jobs.push(job);
          _self.originJobs.push(job);
          // 默认按 Node 排序
          _self.jobs.sort(compare);
          _self.originJobs.sort(compare);
        }

        // 对象数组排序函数
        function compare(job1, job2) {
          var node1 = job1.node;
          var node2 = job2.node;
          if (node1 < node2) {
            return -1;
          } else if (node1 > node2) {
            return 1;
          } else {
            return 0;
          }
        }
      }).catch(function (e) {
        console.log('读取config.xml失败', e)
      })
    },
    parseFreeStyleJobFromXml(projectNode) {
      var _self = this;
      var node = '';
      var param = '[N]';
      var disabled = '';
      var timerTrigger = '';
      var concurrentBuild = '';

      var assignedNodes = projectNode.getElementsByTagName('assignedNode');
      if (assignedNodes.length > 0) {
        node = assignedNodes[0].textContent
      } else {
        // 没有 assignedNode，查找参数
        if (_self.nodeParams.length > 0) {
          [node, param] = _self.getParamsNode(projectNode);
        }
      }
      // disabled
      var disabledNodes = projectNode.getElementsByTagName('disabled');
      if (disabledNodes.length > 0) {
        disabled = disabledNodes[0].textContent
      }
      // timerTrigger
      var timerTriggerNodes = projectNode.getElementsByTagName('hudson.triggers.TimerTrigger');
      if (timerTriggerNodes.length > 0) {
        timerTrigger = timerTriggerNodes[0].getElementsByTagName('spec')[0].textContent;
      }
      // concurrentBuild
      var concurrentBuildNodes = projectNode.getElementsByTagName('concurrentBuild');
      if (concurrentBuildNodes.length > 0) {
        concurrentBuild = concurrentBuildNodes[0].textContent;
      }
      return {
        node,
        param,
        disabled,
        timerTrigger,
        concurrentBuild,
      }
    },
    parsePipelineJobFromXml(flowNode) {
      var _self = this;
      var node = '';
      var param = '';
      var disabled = '';
      var timerTrigger = '';
      var concurrentBuild = '';

      // disabled
      var disabledNodes = flowNode.getElementsByTagName('disabled');
      if (disabledNodes.length > 0) {
        disabled = disabledNodes[0].textContent
      }
      // timerTrigger
      var timerTriggerNodes = flowNode.getElementsByTagName('hudson.triggers.TimerTrigger');
      if (timerTriggerNodes.length > 0) {
        timerTrigger = timerTriggerNodes[0].getElementsByTagName('spec')[0].textContent;
      }
      // concurrentBuild
      var concurrentBuildNodes = flowNode.getElementsByTagName('org.jenkinsci.plugins.workflow.job.properties.DisableConcurrentBuildsJobProperty');
      if (concurrentBuildNodes.length > 0) {
        concurrentBuild = 'false'
      } else {
        concurrentBuild = 'true'
      }
      // node
      var assignedNodes = flowNode.getElementsByTagName('assignedNode');
      if (assignedNodes.length > 0) {
        node = assignedNodes[0].textContent
      } else {
        // 没有 assignedNode，查找参数
        if (_self.nodeParams.length > 0) {
          [node, param] = _self.getParamsNode(flowNode);
        }
      }

      return {
        node,
        param,
        disabled,
        timerTrigger,
        concurrentBuild,
      }
    },
    getParamsNode(rootNode) {
      var _self = this;
      var node = '';
      var param = '';
      var parameterDefinitionsNodes = rootNode.getElementsByTagName('parameterDefinitions');
      if (parameterDefinitionsNodes.length > 0) {
        parameterDefinitionsNodes = parameterDefinitionsNodes[0].childNodes;
        var params = {};
        for (var paramIndex = 0; paramIndex < parameterDefinitionsNodes.length; paramIndex++) {
          var paramNode = parameterDefinitionsNodes[paramIndex];
          if (paramNode.nodeType === Node.TEXT_NODE) {
            continue;
          }
          var nameNodes = paramNode.getElementsByTagName('name');
          if (nameNodes.length === 0) {
            continue;
          }
          var name = paramNode.getElementsByTagName('name')[0].textContent;
          var value = '';
          var defaultValueNodes = paramNode.getElementsByTagName('defaultValue');
          if (defaultValueNodes.length > 0) {
            value = defaultValueNodes[0].textContent;
          } else {
            var choiceNodes = paramNode.getElementsByTagName('choices');
            if (choiceNodes.length > 0) {
              choiceNodes = choiceNodes[0].getElementsByTagName('a');
              choiceNodes = choiceNodes[0].childNodes;
              for (var choiceNodeIndex = 0; choiceNodeIndex < choiceNodes.length; choiceNodeIndex++) {
                if (choiceNodes[choiceNodeIndex].nodeType === Node.TEXT_NODE) {
                  continue;
                }
                value = choiceNodes[choiceNodeIndex].textContent;
                break;
              }
            }
          }
          params[name] = value;
        }
        for (var nodeParamsIndex = 0; nodeParamsIndex < _self.nodeParams.length; nodeParamsIndex++) {
          if (params.hasOwnProperty(_self.nodeParams[nodeParamsIndex])) {
            param = _self.nodeParams[nodeParamsIndex];
            node = params[param];
            break;
          }
        }
      }
      return [node, param];
    }
  }
});
