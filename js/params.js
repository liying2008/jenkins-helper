new Vue({
  el: '#app',
  data: {
    strings: {
      monitor: chrome.i18n.getMessage("monitor"),
      params: chrome.i18n.getMessage("params"),
      buildStatus_: chrome.i18n.getMessage("buildStatus_"),
      runLabel_: chrome.i18n.getMessage("runLabel_"),
      copied: chrome.i18n.getMessage("copied"),
      paramsList: chrome.i18n.getMessage("paramsList"),
      noData: chrome.i18n.getMessage("noData"),
    },
    fullDisplayName: '',
    url: '',
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
        var m = url.match(urlRegExp);
        if (m == null) {
          // 没有匹配到
          return
        }
        var jsonUrl = m[0] + '/api/json';
        fetch(jsonUrl).then(function (res) {
          if (res.ok) {
            return res.json();
          } else {
            return Promise.reject(res);
          }
        }).then(function (data) {
          _self.fullDisplayName = data.fullDisplayName;
          _self.url = data.url;
          _self.result = data.result;
          _self.buildTime = new Date(data.timestamp).toLocaleString();
          _self.builtOn = data.builtOn;
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
        });
      })
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
    rebuild() {
      chrome.tabs.create({'url': this.url + 'rebuild'});
    },
  }
});
