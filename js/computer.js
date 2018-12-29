new Vue({
  el: '#app',
  data: {
    strings: {
      monitor: chrome.i18n.getMessage("monitor"),
      params: chrome.i18n.getMessage("params"),
      computer: chrome.i18n.getMessage("computer"),
      manageMonitoredNodes: chrome.i18n.getMessage("manageMonitoredNodes"),
      openManagerPage: chrome.i18n.getMessage("openManagerPage"),
    },
    monitoredNodes: {},
  },
  mounted() {
    this.queryMonitoredNodes();
    StorageService.addStorageListener(this.nodeStatusChange);
  },
  computed: {},
  methods: {
    nodeStatusChange(changes) {
      // console.log(changes)
      if (StorageService.keyForNodes in changes) {
        // nodes 数据改变
        this.queryMonitoredNodes()
      }
    },
    queryMonitoredNodes() {
      var _self = this;
      StorageService.getNodeStatus(function (result) {
        console.log('monitoredNodes', result);
        _self.monitoredNodes = result;
      });
    },
    removeMonitor(jenkinsUrl) {
      var _self = this;
      StorageService.getNodeStatus(function (result) {
        if (result.hasOwnProperty(jenkinsUrl)) {
          delete result[jenkinsUrl];
          StorageService.saveNodeStatus(result, function () {
            console.log(jenkinsUrl + ' 已删除')
          })
        }
      })
    },
    // 磁盘空间是否未达阈值
    isSafe: function (node) {
      if (node.offline) {
        return false
      }
      var remainingDiskSpace = parseInt(node.remainingDiskSpace.replace('GB', '').trim());
      var threshold = node.diskSpaceThreshold;
      return remainingDiskSpace > threshold;
    },
    openNodesManager(jenkinsUrl) {
      chrome.windows.create({
        url: 'computers_manager.html?jenkins=' + jenkinsUrl,
        type: 'popup',
        width: 1000,
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
        width: 1200,
        height: 800,
      }, function (window) {
        console.log('window', window)
      })
    },
  }
});
