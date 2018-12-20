new Vue({
  el: '#app',
  data: {
    strings: {
      monitor: chrome.i18n.getMessage("monitor"),
      params: chrome.i18n.getMessage("params"),
      computer: chrome.i18n.getMessage("computer"),
    },

  },
  mounted() {
    StorageService.addStorageListener(this.nodeStatusChange);
  },
  methods: {
    nodeStatusChange(changes) {

    },

    openNodesManager() {
      chrome.windows.create({
        url: 'computers_manager.html',
        type: 'popup',
        width: 1200,
        height: 800,
      }, function (window) {
        console.log('window', window)
      })
    },
    openOptions() {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage(); // Chrome 42+, Firefox 48
      } else {
        chrome.tabs.create({'url': chrome.runtime.getURL('options.html')});
      }
    },
    openJobList() {
      chrome.windows.create({
        url: 'job_stats.html',
        type: 'popup',
        width: 1000,
        height: 800,
      }, function (window) {
        console.log('window', window)
      })
    },
  }
});
