new Vue({
  el: '#app',
  data: {
    strings: {
      monitor: browser.i18n.getMessage("monitor"),
      params: browser.i18n.getMessage("params"),
      computer: browser.i18n.getMessage("computer"),
      tools: browser.i18n.getMessage("tools"),
      buildStatus_: browser.i18n.getMessage("buildStatus_"),
      runLabel_: browser.i18n.getMessage("runLabel_"),
      copied: browser.i18n.getMessage("copied"),
      paramsList: browser.i18n.getMessage("paramsList"),
      noData: browser.i18n.getMessage("noData"),
      fetching: browser.i18n.getMessage("fetching"),
      passwordParameter: browser.i18n.getMessage("passwordParameter"),
      fileParameter: browser.i18n.getMessage("fileParameter"),
      credentialsParameter: browser.i18n.getMessage("credentialsParameter"),
      building: 'BUILDING',
    },
    // status 的状态说明：
    // 0：无数据
    // 1：正在请求数据
    // 2：请求完成（有数据）
    // -1：请求失败
    status: 0,
    // 之前的状态（上一次的状态）
    preStatus: 0,
    number: 0,
    fullDisplayName: '',
    url: '',
    building: false,
    result: '',
    buildTime: '',
    builtOn: '',
    parameters: [],
    // 是否禁用下载按钮
    disableDownload: false,
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
        var urlRegExp = /^https*:\/\/.+\/job\/[^/]+\/\d+/;
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
      _self.status = 1;
      var jsonUrl = url + '/api/json';
      // console.log("jsonUrl", jsonUrl);
      fetch(jsonUrl, Tools.getDefaultFetchOption()).then(function (res) {
        if (res.ok) {
          return res.json();
        } else {
          return Promise.reject(res);
        }
      }).then(function (data) {
        _self.status = 2;
        _self.preStatus = 2;
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
              var _class = parameters[pIndex]._class;
              param = {
                hidden: false,
                name: parameters[pIndex].name,
                value: parameters[pIndex].value,
              };
              // 额外处理几个特殊类型的参数
              if (_class === 'hudson.model.PasswordParameterValue' && param.value === undefined) {
                // 密码参数
                param.hidden = true;
                param.value = '<' + _self.strings.passwordParameter + '>'
              } else if (_class === 'com.cloudbees.plugins.credentials.CredentialsParameterValue' && param.value === undefined) {
                // 凭据参数
                param.hidden = true;
                param.value = '<' + _self.strings.credentialsParameter + '>'
              } else if (_class === 'hudson.model.FileParameterValue' && param.value === undefined) {
                // 文件参数
                param.hidden = true;
                param.value = '<' + _self.strings.fileParameter + '>'
              } else if (_class === 'hudson.model.RunParameterValue') {
                // 运行时参数
                param.value = parameters[pIndex].jobName + ' #' + parameters[pIndex].number
              }
              _self.parameters.push(param)
            }
          }
        }
      }).catch(function (e) {
        console.error("获取参数失败", e);
        _self.status = _self.preStatus;
        alert(_self.strings.noData)
      });
    },
    getCurrentTab(callback) {
      browser.tabs.query({active: true, currentWindow: true}).then(function (tabs) {
        if (callback) callback(tabs.length ? tabs[0] : null);
      });
    },
    openOptions() {
      if (browser.runtime.openOptionsPage) {
        browser.runtime.openOptionsPage(); // Chrome 42+, Firefox 48
      } else {
        browser.tabs.create({'url': browser.runtime.getURL('options.html')});
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
    // 下载日志
    downloadConsoleLog() {
      var _self = this;
      _self.disableDownload = true;
      browser.downloads.download({
        url: this.url + 'logText/progressiveText?start=0',
        filename: this.fullDisplayName + ' Console Log.log',
        saveAs: true
      }).then(function (downloadId) {
        _self.disableDownload = false;
        console.log('downloadId', downloadId);
      })
    },
    // 去“配置”页
    goToConfigure() {
      var url = this.url.substring(0, this.url.length - 1);
      var configureUrl = url.substring(0, url.lastIndexOf('/')) + '/configure';
      browser.tabs.create({'url': configureUrl});
    },
    rebuild() {
      browser.tabs.create({'url': this.url + 'rebuild'});
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
        alert(browser.i18n.getMessage("noPrevBuild"))
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
      browser.windows.create({
        url: 'job_stats.html',
        type: 'popup',
        width: 1200,
        height: 800,
      }).then(function (window) {
        console.log('window', window)
      })
    },
  }
});
