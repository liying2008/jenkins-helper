new Vue({
  el: '#app',
  data: {
    strings: {
      monitor: browser.i18n.getMessage("monitor"),
      params: browser.i18n.getMessage("params"),
      computer: browser.i18n.getMessage("computer"),
      tools: browser.i18n.getMessage("tools"),
      manageMonitoredNodes: browser.i18n.getMessage("manageMonitoredNodes"),
      openManagerPage: browser.i18n.getMessage("openManagerPage"),
      displayName: browser.i18n.getMessage("displayName"),
      remainingDiskSpace: browser.i18n.getMessage("remainingDiskSpace"),
      diskSpaceThreshold: browser.i18n.getMessage("diskSpaceThreshold"),
    },
    refreshIconNormal: true,
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
    // 刷新节点信息
    refreshNodesInfo() {
      var _self = this;
      StorageService.getOptions(function (options) {
        Tools.setJenkinsTokens(options.jenkinsTokens || []);
        NodeServices.queryNodeStatus();
      });
      _self.refreshIconNormal = false;
      setTimeout(function () {
        _self.refreshIconNormal = true;
      }, 2000);
    },
    openNodesManager(jenkinsUrl) {
      browser.windows.create({
        url: 'computers_manager.html?jenkins=' + jenkinsUrl,
        type: 'popup',
        width: 1000,
        height: 800,
      }).then(function (window) {
        console.log('window', window)
      })
    },
    openOptions() {
      if (browser.runtime.openOptionsPage) {
        browser.runtime.openOptionsPage(); // Chrome 42+, Firefox 48
      } else {
        browser.tabs.create({'url': browser.runtime.getURL('options.html')});
      }
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
