var ParamsStashRecover = (function () {
  "use strict";

  var CMD_STASH_PARAMS = "stash_params";
  var CMD_RECOVER_PARAMS = "recover_params";

  var PAGE_BUILD = 'build';
  var PAGE_PARAMETERS = 'parameters';

  var extensionName = chrome.i18n.getMessage("extName");
  var ok = chrome.i18n.getMessage("ok");

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

  /**
   * 当前页面是否是 Build 页面 或 Rebuild页面
   * @returns {null|*}
   */
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

  /**
   * 当前页面是否是参数页面
   * @returns {null|*}
   */
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

  /**
   * 从构建页面或Rebuild页面获取当前填写的参数
   * @returns {*[]}
   */
  function getBuildPageParameters(table) {
    // 暂存的参数
    var stashedParams = {};
    // 不能被暂存的参数
    var cannotStashed = [];
    var parameters = $("tbody tr td.setting-main div[name='parameter']", table);
    var size = parameters.length;
    for (var i = 0; i < size; i++) {
      var parameter = parameters[i];
      var children = $(parameter).children();
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

        if (type === 'password' || type === 'file' || type === 'hidden' || name === 'credentialType') {
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

  /**
   * 从参数页面获取当前填写的参数
   *
   * @returns {*[]}
   */
  function getParametersPageParameters(table) {
    // 暂存的参数
    var stashedParams = {};
    // 不能被暂存的参数
    var cannotStashed = [];
    var settingMains = $("tbody tr td.setting-main", table);
    var size = settingMains.length;
    for (var i = 0; i < size; i++) {
      var settingMain = settingMains[i];
      var settingName = $(settingMain).prev();
      if (settingName && settingName.hasClass('setting-name')) {
        var pname = settingName.text()
      } else {
        continue
      }
      console.log('pname', pname);
      var children = $(settingMain).children();
      // console.log('children', children);
      if (children.length === 0) {
        console.log('getParametersPageParameters0', pname + ' can not be stashed!');
        cannotStashed.push(pname);
        continue
      } else {
        var param = children[0];
        var type = param.type;
        var name = param.name;
        if (param.tagName !== 'INPUT' && param.tagName !== 'TEXTAREA') {
          console.log('getParametersPageParameters1', pname + ' can not be stashed!');
          cannotStashed.push(pname);
          continue
        } else if (param.type === 'password') {
          console.log('getParametersPageParameters2', pname + ' can not be stashed!');
          cannotStashed.push(pname);
          continue
        }
        var value = param.value;
        if (param.type === 'checkbox') {
          value = param.checked
        }
        console.log('param', 'PNAME=' + pname + ', tagName=' + param.tagName + ', type=' + type + ', name=' + name + ', value=' + value);
        stashedParams[pname] = {
          'type': type,
          'name': name,
          'value': value,
        }
      }
    } // end for
    return [stashedParams, cannotStashed]
  }

  /**
   * 从上次暂存中恢复参数
   */
  function recoverParameters(table) {
    var message = {
      "cmd": CMD_RECOVER_PARAMS
    };
    chrome.runtime.sendMessage(message, function (resp) {
      if (resp.code !== 0) {
        var failureMsgTitle = '<p style="font-size: 16px; font-weight: bold; color:red;">' + chrome.i18n.getMessage("content_parametersReadFailed") + '</p>';
        console.log('recoverParameters: 读取参数失败！');
        jenkinsHelperAlert(extensionName, failureMsgTitle, ok);
        return
      }
      var params = resp.data;
      var cannotRecovered = {};

      var parameters = $("tbody tr td.setting-main div[name='parameter']", table);
      var size = parameters.length;
      for (var i = 0; i < size; i++) {
        var parameter = parameters[i];
        var children = $(parameter).children();
        if (children.length < 1) {
          continue
        } else if (children.length < 2) {
          var c0 = children[0];
          if (c0.name !== 'name') {
            continue
          }
          // <input name="name" type="hidden" value="PARAM1">
          console.log('recoverParameters', c0.value + ' failed to recovered!');
          cannotRecovered[c0.value] = params[c0.value]
        } else {
          c0 = children[0];
          var c1 = children[1];
          if (c0.name !== 'name') {
            continue
          } else if (!params.hasOwnProperty(c0.value)) {
            console.log('没有暂存该参数: ' + c0.value);
            cannotRecovered[c0.value] = '';
            continue
          }

          var pname = c0.value;
          var type = c1.type;
          var name = c1.name;
          var value = params[pname].value;
          // console.log('stashed value', value);

          if (type === 'file' || type === 'hidden' || name === 'credentialType') {
            // 无法恢复的参数类型
            console.log('recoverParameters', pname + ' failed to recovered!');
            cannotRecovered[pname] = '';
            continue
          } else if (type === 'checkbox') {
            // checkbox 特殊处理
            c1.checked = value
          } else {
            c1.value = value
          }
        } // end if
      } // end for
      if (cannotRecovered) {
        failureMsgTitle = '<p style="font-size: 16px; font-weight: bold; color:red;">' + chrome.i18n.getMessage("content_failedToRecover") + '</p>';
        jenkinsHelperAlert(extensionName, failureMsgTitle + getReadableParams(cannotRecovered), ok)
      }
    })
  }

  /**
   * 获取可读性较好的参数列表
   * @param params
   * @returns {string}
   */
  function getReadableParams(params) {
    var str = '';
    Object.keys(params).forEach(function (key) {
      str += '<b>' + key + ':</b> ' + params[key].value + '<br>'
    });
    return str
  }

  /**
   * 暂存参数
   * @param stashedParams 可以被暂存的参数
   * @param cannotStashed 无法被暂存的参数
   */
  function saveParameters(stashedParams, cannotStashed) {
    var message = {
      "cmd": CMD_STASH_PARAMS,
      "data": stashedParams,
    };
    chrome.runtime.sendMessage(message, function (resp) {
      console.log('resp', resp);
      if (resp.code === 0) {
        console.log('saved.');
        // console.log(getReadableParams(params));
        var successMsgTitle = '<p style="font-size: 16px; font-weight: bold; color:green;">' + chrome.i18n.getMessage("content_saveSuccess") + '</p>';
        var alertMsg = successMsgTitle + getReadableParams(stashedParams);
        if (cannotStashed.length > 0) {
          var failureMsgTitle = '<p style="font-size: 16px; font-weight: bold; color:red;">' + chrome.i18n.getMessage("content_supportOrSaveFail") + '</p>';
          alertMsg += failureMsgTitle + '<b>' + cannotStashed.join('<br>') + '</b>'
        }
        jenkinsHelperAlert(extensionName, alertMsg, ok)
      } else {
        console.log('error in saving.');
        failureMsgTitle = '<p style="font-size: 16px; font-weight: bold; color:red;">' + chrome.i18n.getMessage("content_dataSavingFailed") + '</p>';
        jenkinsHelperAlert(extensionName, failureMsgTitle + resp.message, ok);
      }
    });
  }

  /**
   * 添加 暂存参数 和 恢复参数 的按钮
   */
  function addStashAndRecoverButtons(table) {
    var tBodies = $('tbody', table);
    var size = tBodies.length;
    if (size === 0) {
      return;
    }
    var lastTBody = tBodies[size - 1];
    if (currentPage === PAGE_BUILD) {
      // 构建页面 或 Rebuild 页面
      var btnTd = $('tr td', lastTBody);
      if (btnTd.length !== 1) {
        return;
      }
      var htmlFile = "js/contents/params_stash_recover_btn_for_build.html";
      readHtml(htmlFile, function (text) {
        // add two buttons
        btnTd.append(text);
        // bind onClick listeners
        bindEvent(table);
      })
    } else if (currentPage === PAGE_PARAMETERS) {
      // 参数页面
      htmlFile = "js/contents/params_stash_recover_btn_for_param.html";
      readHtml(htmlFile, function (text) {
        // add stash buttons
        $(text).insertAfter(lastTBody);
        // bind onClick listeners
        bindEvent(table);
      })
    }
  }

  /**
   * 绑定事件
   */
  function bindEvent(table) {
    $("#jenkins-helper-stash-parameters").on("click", function () {
      var params = undefined;
      if (currentPage === PAGE_BUILD) {
        params = getBuildPageParameters(table)
      } else if (currentPage === PAGE_PARAMETERS) {
        params = getParametersPageParameters(table)
      }
      if (!params) {
        console.log('获取参数失败');
        var failureMsgTitle = '<p style="font-size: 16px; font-weight: bold; color:red;">Parsing parameters failed!</p>';
        jenkinsHelperAlert(extensionName, failureMsgTitle, ok);
        return
      }
      // 暂存的参数
      var stashedParams = params[0];
      // 不能被暂存的参数
      var cannotStashed = params[1];
      // save parameters to extension local storage
      saveParameters(stashedParams, cannotStashed);
    });
    $("#jenkins-helper-recover-parameters").on("click", function () {
      recoverParameters(table)
    });
  }

  /**
   * 当前所在页面
   * @type {string}
   */
  var currentPage = PAGE_BUILD;

  /**
   * 启用参数暂存和参数恢复功能
   */
  function enable() {
    var table = isBuildPage();
    if (table != null) {
      currentPage = PAGE_BUILD;
      addStashAndRecoverButtons(table);
    } else {
      table = isParametersPage();
      if (table != null) {
        currentPage = PAGE_PARAMETERS;
        addStashAndRecoverButtons(table);
      }
    }
  }

  return {
    enable,
  }
})();
