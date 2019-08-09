new Vue({
  el: '#app',
  data: {
    strings: {
      jenkinsUrlInputPlaceholder: 'Jenkins url, for example: http://127.0.0.1:8080/jenkins/',
      requestPathInputPlaceholder: 'Request path, for example: job/Job1/config.xml',
      jenkinsUsernameInputPlaceholder: 'Jenkins username (Optional)',
      jenkinsPasswordInputPlaceholder: 'Jenkins password or api token (Optional)',
    },
    baseUrl: '',
    requestPath: '',
    requestData: '',
    responseData: '',
    username: '',
    password: '',
    useCrumb: true,
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
    getRequestHeader(callback, header = {}, method = 'GET') {
      if (this.username && this.password) {
        header['Authorization'] = 'Basic ' + window.btoa(this.username + ':' + this.password);
        callback({
          method: method,
          mode: 'cors',
          redirect: 'follow',
          headers: new Headers(header)
        })
      } else {
        Tools.getFetchOption(this.requestUrl, callback, header, method);
      }
    },

    /**
     * 执行 GET 请求
     */
    invokeGet() {
      var _self = this;
      this.responseData = '';

      this.getRequestHeader(function (header) {
        fetch(_self.requestUrl, header).then(function (res) {
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
      })
    },

    /**
     * 执行 POST 请求
     */
    invokePost() {
      var _self = this;
      this.responseData = '';
      if (this.useCrumb) {
        // 先获取 crumb
        this.getJenkinsCrumbValue(function (crumbKey, crumbValue, e) {
          if (e != null) {
            _self.responseData = e.message || 'Failed to fetch jenkins crumb.';
            return
          }
          console.log('Jenkins-Crumb: ', crumbKey, crumbValue);
          _self.postXml(crumbKey, crumbValue)
        })
      } else {
        _self.postXml(undefined, undefined)
      }
    },
    /**
     * 获取 Jenkins crumb value
     * @param callback
     */
    getJenkinsCrumbValue(callback) {
      // http://127.0.0.1:8080/jenkins/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)
      var _self = this;
      var encodeParam = encodeURI('concat(//crumbRequestField,":",//crumb)');
      var tmpBaseUrl = this.baseUrl.charAt(this.baseUrl.length - 1) === '/' ?
        this.baseUrl.substring(0, this.baseUrl.length - 1) : this.baseUrl;
      var url = tmpBaseUrl + '/crumbIssuer/api/xml?xpath=' + encodeParam;

      this.getRequestHeader(function (header) {
        fetch(url, header).then(function (res) {
          if (res.ok) {
            return res.text();
          } else {
            return Promise.reject(res);
          }
        }).then(function (data) {
          var sepIndex = data.indexOf(':');
          if (sepIndex > 0 && sepIndex < data.length - 1) {
            var key = data.substring(0, sepIndex);
            var value = data.substring(sepIndex + 1);
            callback(key, value, null)
          } else {
            callback(null, null, 'Bad format for crumb data.')
          }
        }).catch(function (e) {
          console.error("getJenkinsCrumbValue 失败", url, e);
          callback(null, null, e)
        });
      })
    },

    postXml(crumbKey, crumbValue) {
      var _self = this;
      var initHeader = {'Content-Type': 'application/xml;charset=UTF-8'};
      if (crumbKey !== undefined && crumbValue !== undefined) {
        initHeader[crumbKey] = crumbValue;
      }
      _self.getRequestHeader(function (header) {
        header['body'] = _self.requestData;
        // console.log('header', header);
        fetch(_self.requestUrl, header).then(function (res) {
          if (res.ok) {
            return res.text();
          } else {
            return Promise.reject(res);
          }
        }).then(function (data) {
          _self.responseData = data || 'OK.';
        }).catch(function (e) {
          console.error("invokePost 失败", _self.requestUrl, e);
          _self.responseData = e.message || 'Failed to updated.';
        });
      }, initHeader, 'POST');
    },
  }
});
