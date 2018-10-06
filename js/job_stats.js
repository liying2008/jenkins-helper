new Vue({
  el: '#app',
  data: {
    strings: {
      title: chrome.i18n.getMessage("jobStatisticsTitle"),
      jobStatisticsDataFrom_: chrome.i18n.getMessage("jobStatisticsDataFrom_"),
    },
    jenkinsUrls: [],
    nodeParams: [],
    jobUrlVisited: [],
    jobs: [],
    xmlParser: undefined,
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      var _self = this;
      _self.xmlParser = new DOMParser();
      StorageService.getOptions(function (result) {
        _self.jenkinsUrls = result.jobStatsJenkinsUrl.trim().split('\n');
        _self.nodeParams = result.nodeParam.trim().split(',');
        _self.getJobStats();
      })
    },
    getJobStats() {
      var _self = this;
      _self.jobs = [];
      _self.jobUrlVisited = [];
      var urlLen = this.jenkinsUrls.length;
      for (var i = 0; i < urlLen; i++) {
        var url = this.jenkinsUrls[i].trim();
        if (url === '') {
          continue
        }
        url = url.charAt(url.length - 1) === '/' ? url.substring(0, url.length - 1) : url;
        if (url.indexOf('/job/') > 0) {
          // Job URL
          this.getJobStatsByUrl(url + '/')
        } else {
          // Jenkins Or View URL
          fetch(url + '/api/json').then(function (res) {
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
            }
          }).catch(function (e) {
            console.error("获取Job URL失败", e);
          });
        }
      }
    },

    getJobStatsByUrl(url) {
      var _self = this;
      if (_self.jobUrlVisited.indexOf(url) >= 0) {
        return
      } else {
        _self.jobUrlVisited.push(url)
      }
      fetch(url + 'config.xml').then(function (res) {
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
          _self.jobs.push(job)
        }
      })
    },
    parseFreeStyleJobFromXml(projectNode) {
      var _self = this;
      var node = '';
      var disabled = '';
      var timerTrigger = '';
      var concurrentBuild = '';

      var assignedNodes = projectNode.getElementsByTagName('assignedNode');
      if (assignedNodes.length > 0) {
        node = assignedNodes[0].textContent
      } else {
        // 没有 assignedNode，查找参数
        if (_self.nodeParams.length > 0) {
          node = _self.getParamsNode(projectNode);
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
        disabled,
        timerTrigger,
        concurrentBuild,
      }
    },
    parsePipelineJobFromXml(flowNode) {
      var _self = this;
      var node = '';
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
          node = _self.getParamsNode(flowNode);
        }
      }

      return {
        node,
        disabled,
        timerTrigger,
        concurrentBuild,
      }
    },
    getParamsNode(rootNode) {
      var _self = this;
      var node = '';
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
            node = params[_self.nodeParams[nodeParamsIndex]];
            break;
          }
        }
      }
      return node;
    }
  }
});
