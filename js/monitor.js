new Vue({
  el: '#app',
  data: {
    strings: {
      url: chrome.i18n.getMessage("url"),
      inputUrlPlaceholder: chrome.i18n.getMessage("inputUrlPlaceholder"),
      monitor: chrome.i18n.getMessage("monitor"),
      params: chrome.i18n.getMessage("params"),
      computer: chrome.i18n.getMessage("computer"),
    },
    inputUrlValue: '',
    btnAddDisable: true,
    jenkinsData: {
      jenkinsUrls: [],
      jobStatus: {}
    }
  },
  mounted() {
    this.getAllJobStatus();
    StorageService.addStorageListener(this.jobStatusChange);
  },
  methods: {
    jobStatusChange(changes) {
      delete changes[StorageService.keyForJenkinsUrl];
      delete changes[StorageService.keyForOptions];
      delete changes[StorageService.keyForNodes];
      if (Object.getOwnPropertyNames(changes).length > 0) {
        // Job Status 有变动
        // 刷新页面
        this.getAllJobStatus()
      }
    },

    getAllJobStatus() {
      var _self = this;
      StorageService.getJenkinsUrls(function (result) {
        _self.jenkinsData.jenkinsUrls = result;
        console.log('result', result);
        StorageService.getJobStatus(result, function (jobResult) {
          console.log('jobResult', jobResult);
          _self.jenkinsData.jobStatus = jobResult;
        })
      })
    },
    // 添加新 Jenkins URL
    addJenkinsUrl() {
      var url = this.inputUrlValue;
      url = url.charAt(url.length - 1) === '/' ? url : url + '/';
      var _self = this;
      if (this.jenkinsData.jenkinsUrls.indexOf(url) === -1) {
        var newUrls = this.jenkinsData.jenkinsUrls.concat(url);
        console.log('newUrls', newUrls);
        StorageService.saveJenkinsUrls(newUrls, function () {
          _self.jenkinsData.jenkinsUrls = newUrls;
          _self.inputUrlValue = '';
          _self.btnAddDisable = true;
        })
      } else {
        _self.inputUrlValue = '';
        _self.btnAddDisable = true;
      }
    },
    // 验证表单
    validateForm() {
      var isFormInvalid = !this.$refs.formUrl.checkValidity();
      var isUrlInvalid = !this.$refs.inputUrl.validity.typeMismatch;

      this.btnAddDisable = isFormInvalid || this.inputUrlValue === '';

      this.$refs.formUrl.classList.toggle('has-error', isFormInvalid && this.inputUrlValue);
      this.$refs.msgError.classList.toggle('hidden', isUrlInvalid);
      this.$refs.msgError.innerText = this.$refs.inputUrl.validationMessage;
    },

    removeJenkins(jenkinsUrl) {
      var _self = this;
      StorageService.removeJenkinsUrls(jenkinsUrl, function () {
        _self.getAllJobStatus();
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
