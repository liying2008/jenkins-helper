(function () {
  "use strict";

  var CMD_STASH_PARAMS = "stash_params";
  var CMD_APPLY_PARAMS = "apply_params";

  var PAGE_BUILD = 'build';
  var PAGE_PARAMETERS = 'parameters';

  // 获取文件内容
  function readHtml(file, result, error) {
    var url = chrome.runtime.getURL(file);
    console.log('url', url);
    fetch(url).then(function (res) {
      if (res.ok) {
        return res.text();
      } else {
        return Promise.reject(res);
      }
    }).then(result).catch(error)
  }

  // Build 页面 或 Rebuild页面
  function isBuildPage() {
    // XPATH: //body[@id='jenkins']//div[@id='main-panel']/form/table[@class='parameters']
    var selector = "body#jenkins div#main-panel form table.parameters";
    var elements = $(selector);
    console.log(elements);
    if (elements.length === 1) {
      return elements[0];
    } else {
      return null;
    }
  }

  // 参数页面
  function isParametersPage() {
    // XPATH: //body[@id='jenkins']//div[@id='main-panel']//table[@class='pane']
    var selector = "body#jenkins div#main-panel table.pane";
    var elements = $(selector);
    console.log(elements);
    if (elements.length === 1) {
      return elements[0];
    } else {
      return null;
    }
  }


  function getBuildPageParameters() {
    // 暂存的参数
    var stashedParams = {};
    // 不能被暂存的参数
    var cannotStashed = [];
    var tBodies = $('tbody', table);
    var size = tBodies.length;
    for (var i = 0; i < size; i++) {
      var parameter = $("tr td.setting-main div[name='parameter']", tBodies[i]);
      var children = parameter.children();
      if (children.length < 1) {
        continue
      } else if (children.length < 2) {
        var c0 = children[0];
        if (c0.name !== 'name') {
          continue
        }
        // <input name="name" type="hidden" value="PARAM1">
        console.log('getBuildPageParameters', c0.value + ' can not be stashed!');
        cannotStashed.push(c0.value)
      } else {
        c0 = children[0];
        var c1 = children[1];
        if (c0.name !== 'name') {
          continue
        }
        var pname = c0.value;
        var type = c1.type;
        var name = c1.name;
        var value = c1.value;
        console.log('param', 'PNAME=' + pname + ', tagName=' + c1.tagName + ', type=' + type + ', name=' + name + ', value=' + value);
        // console.log('param', 'PNAME=' + pname + ', checked=' + c1.checked);

        if (type === 'file' || type === 'hidden' || name === 'credentialType') {
          // 无法暂存的参数类型
          console.log('getBuildPageParameters', pname + ' can not be stashed!');
          cannotStashed.push(pname);
          continue
        } else if (type === 'checkbox') {
          // checkbox 特殊处理
          value = c1.checked
        }

        stashedParams[pname] = {
          'type': type,
          'name': name,
          'value': value,
        }
      } // end if
    } // end for
    return [stashedParams, cannotStashed]
  }

  function getParametersPageParameters() {

  }

  function applyParameters() {

  }

  function getReadableParams(params) {
    var str = '';
    Object.keys(params).forEach(function (key) {
      str += key + ': ' + params[key].value + '\n'
    });
    return str
  }

  function saveParameters(params) {
    var message = {
      "cmd": CMD_STASH_PARAMS,
      "data": params,
    };
    chrome.runtime.sendMessage(message, function (resp) {
      console.log('resp', resp);
      if (resp.code === 0) {
        console.log('saved.');
        alert('Data saved successfully!\n\n' + getReadableParams(params))
      } else {
        console.log('error in saving.');
        alert('Data saving failed!\n\n' + resp.message);
      }
    });
  }

  function addStashAndApplyButtons() {
    var tBodies = $('tbody', table);
    var size = tBodies.length;
    if (size === 0) {
      return;
    }
    var lastTBody = tBodies[size - 1];
    var btnTd = $('tr td', lastTBody);
    if (btnTd.length !== 1) {
      return;
    }
    var htmlFile = "js/contents/params_stash_apply_btn.html";
    readHtml(htmlFile, function (text) {
      // add two buttons
      btnTd.append(text);
      // bind onClick listeners
      bindEvent(table);
    })
  }

  function bindEvent() {
    $("#jenkins-helper-stash-parameters").on("click", function () {
      var params = undefined;
      if (currentPage === PAGE_BUILD) {
        params = getBuildPageParameters()
      } else if (currentPage === PAGE_PARAMETERS) {
        params = getParametersPageParameters()
      }
      if (!params) {
        console.log('获取参数失败');
        alert('Parsing parameters failed!');
        return
      }
      // 暂存的参数
      var stashedParams = params[0];
      // 不能被暂存的参数
      var cannotStashed = params[1];
      // save parameters to extension local storage
      saveParameters(stashedParams);
      // alert cannot stashed params
      if (cannotStashed.length > 0) {
        alert('Unsupported parameters: \n\n' + cannotStashed.join('\n'))
      }
    });
    $("#jenkins-helper-apply-parameters").on("click", function () {
      applyParameters()
    });
  }

  var currentPage = PAGE_BUILD;
  var table = isBuildPage();
  if (table != null) {
    currentPage = PAGE_BUILD;
    addStashAndApplyButtons();
  } else {
    table = isParametersPage();
    if (table != null) {
      currentPage = PAGE_PARAMETERS;
      addStashAndApplyButtons();
    }
  }

})();
