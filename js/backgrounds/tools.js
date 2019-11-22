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

  /**
   * 根据毫秒时间戳获取可读时间字符串
   * @param timestamp 毫秒时间戳
   * @param withSep 是否含有日期时间分隔符
   * @returns {string}
   */
  function getReadableTime(timestamp, withSep = true) {
    if (timestamp === undefined || timestamp === null || timestamp === 0) {
      return ''
    }
    var d = new Date(timestamp);
    var year = d.getFullYear();
    var month = zeroFill(d.getMonth() + 1);
    var day = zeroFill(d.getDate());
    var hour = zeroFill(d.getHours());
    var minute = zeroFill(d.getMinutes());
    var second = zeroFill(d.getSeconds());
    if (withSep) {
      return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    } else {
      return '' + year + month + day + hour + minute + second;
    }
  }

  /**
   * 前位补零
   */
  function zeroFill(i) {
    if (i >= 0 && i <= 9) {
      return "0" + i;
    } else {
      return i;
    }
  }

  return {
    isChrome,
    jobStatus,
    labelClass,
    getDefaultFetchOption,
    getFetchOption,
    getReadableTime,
  }
})();
