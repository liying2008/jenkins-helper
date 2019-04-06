new Vue({
  el: '#app',
  data: {
    strings: {
      monitor: chrome.i18n.getMessage("monitor"),
      params: chrome.i18n.getMessage("params"),
      computer: chrome.i18n.getMessage("computer"),
      buildStatus_: chrome.i18n.getMessage("buildStatus_"),
      runLabel_: chrome.i18n.getMessage("runLabel_"),
      copied: chrome.i18n.getMessage("copied"),
      paramsList: chrome.i18n.getMessage("paramsList"),
      noData: chrome.i18n.getMessage("noData"),
      building: 'BUILDING',
    },
    number: 0,
    fullDisplayName: '',
    url: '',
    building: false,
    result: '',
    buildTime: '',
    builtOn: '',
    parameters: []
  },
  mounted() {
    this.getParameters()
  },
  methods: {
    getParameters() {
      var _self = this;
      this.getCurrentTab(function (tab) {
        // console.log(tab);
        var title = tab.title;
        var url = tab.url;
        var urlRegExp = /^https*:\/\/.+\/job\/.+\/\d+/;
        var urlRegExpPipeline = /^(https*:\/\/.+\/)blue\/organizations\/jenkins\/.+\/detail\/(.+\/\d+)\//;
        var urlRegExpPipelineLog = /^(https*:\/\/.+\/)blue\/rest\/organizations\/jenkins\/pipelines\/(.+)\/runs\/(\d+)\//;
        var m = url.match(urlRegExp);
        var buildUrl = '';
        if (m == null) {
          // 普通Jenkins URL 没有匹配到
          m = url.match(urlRegExpPipeline);
          if (m == null) {
            // Jenkins Pipeline URL 没有匹配到
            m = url.match(urlRegExpPipelineLog);
            if (m == null) {
              // Jenkins Pipeline Log URL 没有匹配到
              return
            } else {
              buildUrl = m[1] + 'job/' + m[2] + '/' + m[3];
            }
          } else {
            buildUrl = m[1] + 'job/' + m[2];
          }
        } else {
          buildUrl = m[0];
        }
        console.log('buildUrl', buildUrl);
        _self.getParametersByUrl(buildUrl);
      })
    },

    getParametersByUrl(url) {
      var _self = this;
      var jsonUrl = url + '/api/json';
      // console.log("jsonUrl", jsonUrl);
      fetch(jsonUrl, Tools.getDefaultFetchOption()).then(function (res) {
        if (res.ok) {
          return res.json();
        } else {
          return Promise.reject(res);
        }
      }).then(function (data) {
        _self.number = data.number;
        _self.fullDisplayName = data.fullDisplayName;
        _self.url = data.url;
        _self.building = data.building;
        _self.result = data.result;
        _self.buildTime = new Date(data.timestamp).toLocaleString();
        _self.builtOn = data.builtOn;
        _self.parameters = [];
        var actions = data.actions;
        for (var i = 0; i < actions.length; i++) {
          if (actions[i].hasOwnProperty('parameters')) {
            var parameters = actions[i].parameters;
            for (var pIndex = 0; pIndex < parameters.length; pIndex++) {
              _self.parameters.push({
                name: parameters[pIndex].name,
                value: parameters[pIndex].value,
              })
            }
          }
        }
      }).catch(function (e) {
        console.error("获取参数失败", e);
        alert(_self.strings.noData)
      });
    },
    getCurrentTab(callback) {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0] : null);
      });
    },
    openOptions() {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage(); // Chrome 42+, Firefox 48
      } else {
        chrome.tabs.create({'url': chrome.runtime.getURL('options.html')});
      }
    },
    // 复制运行节点
    copyBuiltOn() {
      var _self = this;
      var text = this.$refs.builtOnSpan.innerText;
      var tempInput = document.createElement('input');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      tempInput.style.display = 'none';
      _self.$refs.copiedSpan.style.visibility = "";
      setTimeout(function () {
        _self.$refs.copiedSpan.style.visibility = "hidden";
      }, 2000);
    },
    downloadConsoleLog() {
      // 下载日志
      chrome.downloads.download({
        url: this.url + 'logText/progressiveText?start=0',
        filename: this.fullDisplayName + ' Console Log.log',
        saveAs: true
      }, function (downloadId) {
        console.log('downloadId', downloadId)
      })
    },
    goToConfigure() {
      var url = this.url.substring(0, this.url.length - 1);
      var configureUrl = url.substring(0, url.lastIndexOf('/')) + '/configure';
      chrome.tabs.create({'url': configureUrl});
    },
    rebuild() {
      chrome.tabs.create({'url': this.url + 'rebuild'});
    },
    // 显示前一次构建信息
    prevBuild() {
      // url: http://127.0.0.1:8080/jenkins/job/Test1/21/
      var url = this.url.substring(0, this.url.length - 1);
      url = url.substring(0, url.lastIndexOf('/'));
      if (this.number > 1) {
        url = url + '/' + (this.number - 1);
        this.getParametersByUrl(url)
      } else {
        alert(chrome.i18n.getMessage("noPrevBuild"))
      }
    },
    // 显示后一次构建信息
    nextBuild() {
      var url = this.url.substring(0, this.url.length - 1);
      url = url.substring(0, url.lastIndexOf('/'));
      url = url + '/' + (this.number + 1);
      this.getParametersByUrl(url)
    },
    openJobList() {
      chrome.windows.create({
        url: 'job_stats.html',
        type: 'popup',
        width: 1200,
        height: 800,
      }, function (window) {
        console.log('window', window)
      })
    },
  }
});
