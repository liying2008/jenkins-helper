new Vue({
  el: '#app',
  data: {
    strings: {
      extName: browser.i18n.getMessage("extName"),
      settings: browser.i18n.getMessage("settings"),
      importAndExportSettings: browser.i18n.getMessage("importAndExportSettings"),
      about: browser.i18n.getMessage("about"),
      importSettings: browser.i18n.getMessage("importSettings"),
      exportSettings: browser.i18n.getMessage("exportSettings"),
      settingsImported: browser.i18n.getMessage("settingsImported"),
    },
    disableExportBtn: false,
    disableImportBtn: false,
  },
  methods: {
    /**
     * 导入设置
     */
    importSettings() {

    },

    /**
     * 导出设置
     */
    exportSettings() {
      var _self = this;
      _self.disableExportBtn = true;
      StorageService.get([StorageService.keyForJenkinsUrl, StorageService.keyForNodes, StorageService.keyForOptions], function (result) {
        browser.management.getSelf().then(function (extensionInfo) {
          console.log('extensionInfo', extensionInfo);
          var fileContent = {
            name: extensionInfo.name,
            version: extensionInfo.version,
            data: result
          };
          console.log('fileContent', fileContent);
          var filename = 'jenkins-helper_settings_' + Tools.getReadableTime(Date.now(), false) + '.json';
          // 开始下载
          _self.triggerDownload(filename, JSON.stringify(fileContent));
          _self.disableExportBtn = false;
        })
      })
    },

    /**
     * 触发下载文件
     * @param filename 文件名
     * @param content 文件内容
     */
    triggerDownload(filename, content) {
      var element = document.createElement('a');
      element.download = filename;
      element.style.display = 'none';
      var blob = new Blob([content]);
      element.href = URL.createObjectURL(blob);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element)
    }
  }
});
