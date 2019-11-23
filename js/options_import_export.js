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
      settingContentIsEmpty: browser.i18n.getMessage("settingContentIsEmpty"),
      settingsFileParsingFailed: browser.i18n.getMessage("settingsFileParsingFailed"),
      settingsFileContentIncorrect: browser.i18n.getMessage("settingsFileContentIncorrect"),
    },
    settingsKeyName: 'jenkins-helper',
    disableExportBtn: false,
    disableImportBtn: false,
  },
  methods: {
    /**
     * 导入设置
     */
    importSettings() {
      this.triggerUpload();
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
            name: _self.settingsKeyName,
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
    },

    /**
     * 触发上传文件
     */
    triggerUpload() {
      var inputElement = this.$refs.configFile;
      inputElement.value = '';
      inputElement.click();
    },

    /**
     * 读取文件内容
     * @param event
     */
    readFile(event) {
      var _self = this;
      // console.log('event', event);
      var inputElement = _self.$refs.configFile;
      var filePath = inputElement.value;
      console.log('filePath', filePath);
      if (filePath) {
        var reader = new FileReader();
        reader.readAsText(inputElement.files[0], "utf-8");
        reader.onload = function () {
          console.log("加载成功");
          // console.log("reader.onload", this);
        };
        reader.onloadstart = function () {
          console.log("开始加载");
          // console.log("reader.onloadstart", this);
        };
        reader.onloadend = function () {
          console.log("加载结束");
          // console.log("reader.onloadend", this);
          // 开始导入
          _self.startImport(this.result)
        }
      }
    },

    /**
     * 开始导入
     * @param content settings文件内容
     */
    startImport(content) {
      var _self = this;
      try {
        var settings = JSON.parse(content);
      } catch (e) {
        console.log(e);
        _self.showDangerMessage(_self.strings.settingsFileParsingFailed);
        return;
      }
      console.log('settings', settings);
      if (settings.name !== _self.settingsKeyName) {
        _self.showDangerMessage(_self.strings.settingsFileContentIncorrect);
        return;
      }
      if (!settings.data || Object.getOwnPropertyNames(settings.data).length === 0) {
        _self.showSuccessMessage(_self.strings.settingContentIsEmpty);
        return;
      }
      StorageService.set(settings.data, function () {
        _self.showSuccessMessage(_self.strings.settingsImported);
      })
    },

    /**
     * 显示成功信息
     * @param successText 信息文本
     */
    showSuccessMessage(successText) {
      var _self = this;
      console.log('showSuccessMessage');
      var msgDiv = _self.$refs.showImportedMsg;
      msgDiv.setAttribute('class', 'alert alert-success');
      msgDiv.innerText = successText;
      msgDiv.style.visibility = "";
      setTimeout(function () {
        msgDiv.style.visibility = "hidden";
      }, 2000);
    },

    /**
     * 显示失败信息
     * @param dangerText 信息文本
     */
    showDangerMessage(dangerText) {
      var _self = this;
      console.log('showDangerMessage');
      var msgDiv = _self.$refs.showImportedMsg;
      msgDiv.setAttribute('class', 'alert alert-danger');
      msgDiv.innerText = dangerText;
      msgDiv.style.visibility = "";
      setTimeout(function () {
        msgDiv.style.visibility = "hidden";
      }, 2000);
    }
  }
});
