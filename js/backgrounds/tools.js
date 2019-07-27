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

  var jenkinsTokens = [];

  function setJenkinsTokens(tokens) {
    jenkinsTokens = tokens
  }

  function getDefaultFetchOption(method = 'GET') {
    return {
      method: method,
      credentials: 'include',
      mode: 'cors',
      redirect: 'follow',
    }
  }
  function getFetchOption(url, method = 'GET') {
    // console.log('jenkinsTokens', jenkinsTokens);
    var token = undefined;
    for (var i = 0; i < jenkinsTokens.length; i++) {
      var currentToken = jenkinsTokens[i];
      if (url.indexOf(currentToken.url) === 0) {
        token = currentToken;
        break
      }
    }
    // console.log('Tool.getFetchOption token', token);
    if (token) {
      return {
        method: method,
        mode: 'cors',
        redirect: 'follow',
        headers: new Headers({
          'Authorization': 'Basic ' + window.btoa(token.username + ':' + token.token)
        })
      }
    } else {
      return getDefaultFetchOption(method)
    }
  }

  return {
    isChrome,
    jobStatus,
    labelClass,
    setJenkinsTokens,
    getDefaultFetchOption,
    getFetchOption
  }
})();
