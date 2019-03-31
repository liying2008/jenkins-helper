var Tools = (function () {
  var jenkinsTokens = [];

  function setJenkinsTokens(tokens) {
    jenkinsTokens = tokens
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
      return {
        method: method,
        credentials: 'include',
        mode: 'cors',
        redirect: 'follow',
      }
    }
  }

  return {
    setJenkinsTokens,
    getFetchOption
  }
})();
