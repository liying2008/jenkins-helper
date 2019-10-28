new Vue({
  el: '#app',
  data: {
    refreshTime: '60',
    nodeRefreshTime: '2',
    strings: {
      extName: browser.i18n.getMessage("extName"),
      settings: browser.i18n.getMessage("settings"),
      importAndExportSettings: browser.i18n.getMessage("importAndExportSettings"),
      about: browser.i18n.getMessage("about"),
      jsonParsingFailed: browser.i18n.getMessage("jsonParsingFailed"),
      monitorOptionTitle: browser.i18n.getMessage("monitorOptionTitle"),
      showNotification: browser.i18n.getMessage("showNotification"),
      refreshTime: browser.i18n.getMessage("refreshTime"),
      nodeOptionTitle: browser.i18n.getMessage("nodeOptionTitle"),
      nodeRefreshTime: browser.i18n.getMessage("nodeRefreshTime"),
      optionsSaved: browser.i18n.getMessage("optionsSaved"),
      globalOptionTitle: browser.i18n.getMessage("globalOptionTitle"),
      defaultTab: browser.i18n.getMessage("defaultTab"),
      jenkinsToken: browser.i18n.getMessage("jenkinsToken"),
      addNewTokenBtn: browser.i18n.getMessage("addNewTokenBtn"),
      omniboxOptionTitle: browser.i18n.getMessage("omniboxOptionTitle"),
      searchFromJenkins: browser.i18n.getMessage("searchFromJenkins"),
      searchFromJenkinsPlaceholder: browser.i18n.getMessage("searchFromJenkinsPlaceholder"),
      searchFromJenkinsTips: browser.i18n.getMessage("searchFromJenkinsTips"),
      saveOptions: browser.i18n.getMessage("saveOptions"),
      jobStatsTitle: browser.i18n.getMessage("jobStatsTitle"),
      jobStatsTitleTip: browser.i18n.getMessage("jobStatsTitleTip"),
      jobStatsJenkinsPlaceholder: browser.i18n.getMessage("jobStatsJenkinsPlaceholder"),
      jobStatsNodeParamTip: browser.i18n.getMessage("jobStatsNodeParamTip"),
      jobStatsNodeParamPlaceholder: browser.i18n.getMessage("jobStatsNodeParamPlaceholder"),
      otherTitle: browser.i18n.getMessage("otherTitle"),
      enableParamsStashAndRecover: browser.i18n.getMessage("enableParamsStashAndRecover"),
      paramsStashAndRecoverTips: browser.i18n.getMessage("paramsStashAndRecoverTips"),
    },
    defaultTab: 'monitor',
    defaultTabs: [
      {
        text: browser.i18n.getMessage("monitor"),
        value: 'monitor',
      },
      {
        text: browser.i18n.getMessage("params"),
        value: 'params',
      },
      {
        text: browser.i18n.getMessage("computer"),
        value: 'computer',
      },
      {
        text: browser.i18n.getMessage("tools"),
        value: 'tools',
      },
    ],
    showNotificationOption: 'all',
    showNotificationOptions: [
      {
        text: browser.i18n.getMessage("showNotificationOption_all"),
        value: 'all'
      },
      {
        text: browser.i18n.getMessage("showNotificationOption_unstable"),
        value: 'unstable'
      },
      {
        text: browser.i18n.getMessage("showNotificationOption_none"),
        value: 'none'
      },
    ],
    omniboxJenkinsUrl: '',
    nodeParam: '',
    jobStatsJenkinsUrl: '',
    jenkinsTokens: [],
    enableParamsStashAndRecover: true,
    optionsJson: '',
    isJsonView: false,
    constants: {
      monitorMinRefreshTime: 5,
      monitorMaxRefreshTime: 300,
      nodeMinRefreshTime: 1,
      nodeMaxRefreshTime: 6,
    },
  },
  computed: {
    refreshTimeTip() {
      console.log(browser.i18n.getMessage("refreshTimeTip_1") + this.refreshTime +
        browser.i18n.getMessage("refreshTimeTip_2"));
      return browser.i18n.getMessage("refreshTimeTip_1") + this.refreshTime +
        browser.i18n.getMessage("refreshTimeTip_2");
    },
    nodeRefreshTimeTip() {
      console.log(browser.i18n.getMessage("nodeRefreshTimeTip_1") + this.nodeRefreshTime +
        browser.i18n.getMessage("nodeRefreshTimeTip_2"));
      return browser.i18n.getMessage("nodeRefreshTimeTip_1") + this.nodeRefreshTime +
        browser.i18n.getMessage("nodeRefreshTimeTip_2");
    }
  },
  mounted() {
    var _self = this;
    StorageService.getOptions(function (result) {
      // console.log('result', result);
      _self.optionsToData(result)
    })
  },
  methods: {
    addNewToken() {
      this.jenkinsTokens.push({})
    },
    arrangeJenkinsTokens() {
      var arrangedJenkinsTokens = [];
      for (var i = 0; i < this.jenkinsTokens.length; i++) {
        var token = this.jenkinsTokens[i];
        if (token.hasOwnProperty('url') && token.url) {
          arrangedJenkinsTokens.push(token)
        }
      }
      // console.log('arrangedJenkinsTokens', arrangedJenkinsTokens);
      return arrangedJenkinsTokens
    },
    dataToOptions() {
      return {
        defaultTab: this.defaultTab,
        jenkinsTokens: this.arrangeJenkinsTokens(),
        refreshTime: this.refreshTime,
        nodeRefreshTime: this.nodeRefreshTime,
        showNotificationOption: this.showNotificationOption,
        omniboxJenkinsUrl: this.omniboxJenkinsUrl,
        nodeParam: this.nodeParam,
        jobStatsJenkinsUrl: this.jobStatsJenkinsUrl,
        enableParamsStashAndRecover: this.enableParamsStashAndRecover,
      };
    },
    optionsToData(options) {
      //// refreshTime
      if (options.refreshTime === undefined) {
        this.refreshTime = '60';
      } else if (parseInt(options.refreshTime) > this.constants.monitorMaxRefreshTime) {
        this.refreshTime = this.constants.monitorMaxRefreshTime.toString();
      } else if (parseInt(options.refreshTime) < this.constants.monitorMinRefreshTime) {
        this.refreshTime = this.constants.monitorMinRefreshTime.toString();
      } else {
        this.refreshTime = parseInt(options.refreshTime).toString();
      }

      //// nodeRefreshTime
      if (options.nodeRefreshTime === undefined) {
        this.nodeRefreshTime = '2';
      } else if (parseInt(options.nodeRefreshTime) > this.constants.nodeMaxRefreshTime) {
        this.nodeRefreshTime = this.constants.nodeMaxRefreshTime.toString();
      } else if (parseInt(options.nodeRefreshTime) < this.constants.nodeMinRefreshTime) {
        this.nodeRefreshTime = this.constants.nodeMinRefreshTime.toString();
      } else {
        this.nodeRefreshTime = parseInt(options.nodeRefreshTime).toString();
      }

      //// showNotificationOption
      var allShowNotificationOptions = this.showNotificationOptions.map(value => value.value);
      // console.log('allShowNotificationOptions', allShowNotificationOptions);
      if (allShowNotificationOptions.indexOf(options.showNotificationOption) >= 0) {
        this.showNotificationOption = options.showNotificationOption;
      }

      //// defaultTab
      var allDefaultTabs = this.defaultTabs.map(value => value.value);
      // console.log('allDefaultTabs', allDefaultTabs);
      if (allDefaultTabs.indexOf(options.defaultTab) >= 0) {
        this.defaultTab = options.defaultTab;
      }

      this.jenkinsTokens = options.jenkinsTokens || [];
      this.omniboxJenkinsUrl = options.omniboxJenkinsUrl;
      this.nodeParam = options.nodeParam;
      this.jobStatsJenkinsUrl = options.jobStatsJenkinsUrl;

      //// enableParamsStashAndRecover
      if (options.enableParamsStashAndRecover === undefined) {
        this.enableParamsStashAndRecover = true;
      } else {
        this.enableParamsStashAndRecover = !!options.enableParamsStashAndRecover
      }
    },
    saveOptions() {
      console.log('saveOptions');
      var _self = this;
      StorageService.getOptions(function (result) {
        var option = _self.dataToOptions();
        option.showDisabledJobs = result.showDisabledJobs;
        // console.log('option', option);
        StorageService.saveOptions(option, function () {
          _self.$refs.showSavedMsg.style.visibility = "";
          setTimeout(function () {
            _self.$refs.showSavedMsg.style.visibility = "hidden";
          }, 2000);
        })
      })
    },
    optionsToJson() {
      this.optionsJson = JSON.stringify(this.dataToOptions(), null, 2)
    },
    jsonToOptions() {
      try {
        var options = JSON.parse(this.optionsJson);
        this.optionsToData(options);
        return true;
      } catch (e) {
        console.log('JSON解析失败：', e);
        this.isJsonView = true;
        alert(this.strings.jsonParsingFailed + ' :\n' + e);
        return false;
      }
    },
    switchView() {
      if (this.isJsonView) {
        // 需要切换到 UI View
        var result = this.jsonToOptions();
        if (result) {
          this.isJsonView = false;
        }
      } else {
        // 需要切换到 JSON View
        this.optionsToJson();
        this.isJsonView = true;
      }
    }
  },
});
