new Vue({
  el: '#app',
  data: {
    strings: {},
    baseUrl: '',
    requestPath: '',
    requestData: '',
    responseData: '',
    username: '',
    password: '',
  },
  computed: {
    requestUrl: function () {
      this.baseUrl = this.baseUrl.trim();
      this.requestPath = this.requestPath.trim();
      if (this.baseUrl === '') {
        return ''
      }
      var tmpBaseUrl = this.baseUrl.charAt(this.baseUrl.length - 1) === '/' ?
        this.baseUrl.substring(0, this.baseUrl.length - 1) : this.baseUrl;
      var tmpRequestPath = this.requestPath.charAt(0) === '/' ?
        this.requestPath.substring(1) : this.requestPath;
      return tmpBaseUrl + '/' + tmpRequestPath
    },
    btnGetDisabled: function () {
      return !this.requestUrl
    },
    btnPostDisabled: function () {
      return !this.requestUrl || !this.requestData
    },
  },
  mounted() {

  },
  methods: {
    getRequestHeader(method = 'GET') {
      var requestHeader = {};
      if (this.username && this.password) {
        var header = {};
        header['Authorization'] = 'Basic ' + window.btoa(this.username + ':' + this.password);
        requestHeader = {
          method: method,
          mode: 'cors',
          redirect: 'follow',
          headers: new Headers(header)
        }
      } else {
        requestHeader = Tools.getFetchOption(this.requestUrl, {}, method);
      }
      return requestHeader
    },
    invokeGet() {
      var _self = this;
      fetch(this.requestUrl, this.getRequestHeader()).then(function (res) {
        if (res.ok) {
          return res.text();
        } else {
          return Promise.reject(res);
        }
      }).then(function (data) {
        _self.responseData = data;
      }).catch(function (e) {
        console.error("invokeGet 失败", _self.requestUrl, e);
        _self.responseData = e.message || 'Failed to fetch.';
      });
    },
    invokePost() {
      var _self = this;
      // 先获取 crumb
      this.getJenkinsCrumbValue(function (value, e) {
        if (e != null) {
          _self.responseData = e.message || 'Failed to fetch jenkins crumb.';
          return
        }
        console.log('crumb value', value)
      })
    },
    /**
     * 获取 Jenkins crumb value
     * @param callback
     */
    getJenkinsCrumbValue(callback) {
      // http://127.0.0.1:8080/jenkins/crumbIssuer/api/xml?xpath=//crumb
      var _self = this;
      var tmpBaseUrl = this.baseUrl.charAt(this.baseUrl.length - 1) === '/' ?
        this.baseUrl.substring(0, this.baseUrl.length - 1) : this.baseUrl;
      var url = tmpBaseUrl + '/crumbIssuer/api/xml?xpath=//crumb';
      fetch(url, this.getRequestHeader()).then(function (res) {
        if (res.ok) {
          return res.text();
        } else {
          return Promise.reject(res);
        }
      }).then(function (data) {
        var startIndex = data.indexOf('<crumb>');
        var endIndex = data.indexOf('</crumb>');
        var value = data.substring(startIndex + 7, endIndex);
        callback(value, null)
      }).catch(function (e) {
        console.error("getJenkinsCrumbValue 失败", url, e);
        callback(null, e)
      });
    },
  }
});
