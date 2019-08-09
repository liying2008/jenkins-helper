var Tools = (function () {
  // 是否是 Chrome 浏览器
  var isChrome = navigator.userAgent.indexOf('Chrome') > -1;

  /**
   * job 状态
   * @type {{red: string, blue: string, aborted: string, yellow: string, notbuilt: string, disabled: string}}
   */
  var jobStatus = {
    blue: 'Success',
    yellow: 'Unstable',
    red: 'Failure',
    aborted: 'Aborted',
    notbuilt: 'Not built',
    disabled: 'Disabled',
  };

  var labelClass = {
    blue: 'label-success',
    yellow: 'label-warning',
    red: 'label-danger',
    aborted: 'label-default',
    notbuilt: 'label-primary',
    disabled: 'label-primary',
  };

  function getDefaultFetchOption(header = {}, method = 'GET') {
    if (header === undefined || header === null) {
      header = {}
    }
    return {
      method: method,
      credentials: 'include',
      mode: 'cors',
      redirect: 'follow',
      headers: new Headers(header)
    }
  }

  function getFetchOption(url, callback, header = {}, method = 'GET') {
    StorageService.getOptions(function (options) {
      var jenkinsTokens = options.jenkinsTokens || [];
      // console.log('jenkinsTokens', jenkinsTokens);
      var token = undefined;
      for (var i = 0; i < jenkinsTokens.length; i++) {
        var currentToken = jenkinsTokens[i];
        if (url.indexOf(currentToken.url) === 0) {
          token = currentToken;
          break
        }
      }
      if (header === undefined || header === null) {
        header = {}
      }
      // console.log('Tool.getFetchOption token', token);
      if (token) {
        header['Authorization'] = 'Basic ' + window.btoa(token.username + ':' + token.token);
        callback({
          method: method,
          mode: 'cors',
          redirect: 'follow',
          headers: new Headers(header)
        })
      } else {
        callback(getDefaultFetchOption(header, method))
      }
    });
  }

  return {
    isChrome,
    jobStatus,
    labelClass,
    getDefaultFetchOption,
    getFetchOption,
  }
})();
