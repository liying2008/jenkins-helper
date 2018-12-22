new Vue({
  el: '#app',
  data: {
    strings: {
      noData: '获取数据失败！'
    },
    inputUrlValue: '',
    nodes: {},
    monitoredNodes: {},
    url: '',
  },

  mounted() {
    this.getInitJenkinsUrl()
  },
  methods: {
    getInitJenkinsUrl() {
      var url = document.location.toString();
      console.log('getInitJenkinsUrl', url);
      var param = url.split("?")[1];
      var jenkinsUrl = param.replace('jenkins=', '');
      if (jenkinsUrl) {
        this.inputUrlValue = jenkinsUrl;
        this.startQuery();
      }
    },
    startQuery() {
      var _self = this;
      StorageService.getNodeStatus(function (result) {
        console.log('monitoredNodes', result);
        _self.monitoredNodes = result;
        _self.queryJenkinsNodes()
      });
    },
    queryJenkinsNodes(jenkinsUrl) {
      var _self = this;
      _self.nodes = {};
      var url = _self.inputUrlValue;
      if (jenkinsUrl === undefined) {
        url = url.charAt(url.length - 1) === '/' ? url : url + '/';
        _self.url = url;
      } else {
        url = jenkinsUrl
      }
      var jsonUrl = url + 'computer/api/json';
      fetch(jsonUrl).then(function (res) {
        if (res.ok) {
          return res.json();
        } else {
          return Promise.reject(res);
        }
      }).then(function (data) {
        var computers = data.computer;
        console.log(computers);
        for (var i = 0; i < computers.length; i++) {
          var displayName = computers[i].displayName;
          var nodeUrl = url + 'computer/' + displayName + '/';
          var workingDirectory = 'N/A';
          var remainingDiskSpace = 'N/A';
          var responseTime = 'N/A';
          var offline = computers[i].offline;
          if (!offline) {
            workingDirectory = computers[i].monitorData['hudson.node_monitors.DiskSpaceMonitor'].path;
            var size = computers[i].monitorData['hudson.node_monitors.DiskSpaceMonitor'].size;
            remainingDiskSpace = (size / 1024.0 / 1024.0 / 1024.0).toFixed(2) + ' GB';
            responseTime = computers[i].monitorData['hudson.node_monitors.ResponseTimeMonitor'].average + 'ms';
          }
          var monitoring = false;
          var diskSpaceThreshold = 0;
          if (_self.monitoredNodes.hasOwnProperty(url)) {
            if (_self.monitoredNodes[url].hasOwnProperty('monitoredNodes')) {
              monitoring = _self.monitoredNodes[url]['monitoredNodes'].hasOwnProperty(displayName);
              if (monitoring) {
                diskSpaceThreshold = _self.monitoredNodes[url]['monitoredNodes'][displayName].diskSpaceThreshold;
              }
            }
          }
          Vue.set(_self.nodes, displayName, {
            nodeUrl,
            workingDirectory,
            remainingDiskSpace,
            responseTime,
            monitoring,
            diskSpaceThreshold,
            offline
          })
        }
        console.log('nodes', _self.nodes)
      }).catch(function (e) {
        console.error("获取数据失败", e);
        alert(_self.strings.noData)
      });
    },
    // 添加监控节点或取消监控节点
    addOrDelMonitorNode(index, displayName) {
      var _self = this;
      // console.log('index', index);
      var thisInput = this.$refs.diskSpaceThreshold[index];
      var diskSpaceThreshold = parseInt(thisInput.value);
      console.log(displayName);
      console.log(diskSpaceThreshold);
      var node = this.nodes[displayName];
      if (node.monitoring) {
        // 之前已监控，需要取消监控
        delete this.monitoredNodes[this.url]['monitoredNodes'][displayName]
      } else {
        // 之前未监控，需要监控
        if (!this.monitoredNodes.hasOwnProperty(this.url)) {
          this.monitoredNodes[this.url] = {
            "status": 'ok',
            "monitoredNodes": {},
          }
        }
        this.monitoredNodes[this.url]['monitoredNodes'][displayName] = {
          nodeUrl: node.nodeUrl,
          workingDirectory: node.workingDirectory,
          remainingDiskSpace: node.remainingDiskSpace,
          responseTime: node.responseTime,
          monitoring: true,
          diskSpaceThreshold: diskSpaceThreshold,
          offline: node.offline
        }

      }
      StorageService.saveNodeStatus(this.monitoredNodes, function () {
        _self.queryJenkinsNodes(_self.url)
      })
    },
  }
});
