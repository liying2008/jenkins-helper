new Vue({
  el: '#app',
  data: {
    refreshTime: '60',
    strings: {
      monitorOptionTitle: chrome.i18n.getMessage("monitorOptionTitle"),
      showNotification: chrome.i18n.getMessage("showNotification"),
      refreshTime: chrome.i18n.getMessage("refreshTime"),
      optionsSaved: chrome.i18n.getMessage("optionsSaved"),
      globalOptionTitle: chrome.i18n.getMessage("globalOptionTitle"),
      defaultTab: chrome.i18n.getMessage("defaultTab"),
      omniboxOptionTitle: chrome.i18n.getMessage("omniboxOptionTitle"),
      searchFromJenkins: chrome.i18n.getMessage("searchFromJenkins"),
      searchFromJenkinsPlaceholder: chrome.i18n.getMessage("searchFromJenkinsPlaceholder"),
      searchFromJenkinsTips: chrome.i18n.getMessage("searchFromJenkinsTips"),
      saveOptions: chrome.i18n.getMessage("saveOptions"),
    },
    defaultTab: 'monitor',
    defaultTabs: [
      {
        text: chrome.i18n.getMessage("monitor"),
        value: 'monitor',
      },
      {
        text: chrome.i18n.getMessage("params"),
        value: 'params',
      }
    ],
    showNotificationOption: 'all',
    showNotificationOptions: [
      {
        text: chrome.i18n.getMessage("showNotificationOption_all"),
        value: 'all'
      },
      {
        text: chrome.i18n.getMessage("showNotificationOption_unstable"),
        value: 'unstable'
      },
      {
        text: chrome.i18n.getMessage("showNotificationOption_none"),
        value: 'none'
      },
    ],
    omniboxJenkinsUrl:''
  },
  computed: {
    refreshTimeTip() {
      console.log(chrome.i18n.getMessage("refreshTimeTip_1") + this.refreshTime +
        chrome.i18n.getMessage("refreshTimeTip_2"));
      return chrome.i18n.getMessage("refreshTimeTip_1") + this.refreshTime +
        chrome.i18n.getMessage("refreshTimeTip_2");
    }
  },
  mounted() {
    var _self = this;
    StorageService.getOptions(function (result) {
      _self.refreshTime = result.refreshTime;
      _self.showNotificationOption = result.showNotificationOption;
      _self.defaultTab = result.defaultTab;
      _self.omniboxJenkinsUrl = result.omniboxJenkinsUrl;
    })
  },
  methods: {
    saveOptions() {
      console.log('saveOptions');
      var _self = this;
      StorageService.saveOptions({
        defaultTab: this.defaultTab,
        refreshTime: this.refreshTime,
        showNotificationOption: this.showNotificationOption,
        omniboxJenkinsUrl: this.omniboxJenkinsUrl
      }, function () {
        _self.$refs.showSavedMsg.style.visibility = "";
        setTimeout(function () {
          _self.$refs.showSavedMsg.style.visibility = "hidden";
        }, 2000);
      })
    }
  },
});