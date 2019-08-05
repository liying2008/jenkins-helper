new Vue({
  el: '#app',
  data: {
    strings: {},
    requestUrl: '',
    requestData: '',
    responseData: '',
    username: '',
    password: '',
  },
  computed: {
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
      });
    },
    invokePost() {
      var _self = this;
      // 先获取 crumb
      // http://127.0.0.1:8080/jenkins/crumbIssuer/api/xml?xpath=//crumb
    },
  }
});
