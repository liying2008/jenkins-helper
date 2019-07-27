var ContentServices = (function () {
  "use strict";

  var CMD_STASH_PARAMS = "stash_params";
  var CMD_RECOVER_PARAMS = "recover_params";
  var CMD_IS_ENABLE_STASH_AND_RECOVER = "is_enable_stash_and_recover";
  var KEY_STASHED_PARAMS = "stashed_params";

  var enableParamsStashAndRecover = false;

  function start() {
    StorageService.getOptions(function (options) {
      if (options.enableParamsStashAndRecover === undefined) {
        enableParamsStashAndRecover = true;
      } else {
        enableParamsStashAndRecover = options.enableParamsStashAndRecover;
      }
    });
    StorageService.addStorageListener(storageChange);


    // 处理来自 content_scripts 的消息
    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      // console.log('request', request);
      // console.log('sender', sender);
      if (request.cmd === CMD_STASH_PARAMS) {
        // 保存参数
        localStorage.setItem(KEY_STASHED_PARAMS, JSON.stringify(request.data));
        sendResponse({"code": 0});
      } else if (request.cmd === CMD_RECOVER_PARAMS) {
        var params = JSON.parse(localStorage.getItem(KEY_STASHED_PARAMS));
        sendResponse({"code": 0, "data": params});
      } else if (request.cmd === CMD_IS_ENABLE_STASH_AND_RECOVER) {
        sendResponse({"code": 0, "data": enableParamsStashAndRecover});
      }
    });
  }

  function storageChange(changes) {
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      // console.log('changes', changes);
      var newOptions = changes[StorageService.keyForOptions].newValue;
      if (newOptions.enableParamsStashAndRecover === undefined) {
        enableParamsStashAndRecover = true;
      } else {
        enableParamsStashAndRecover = newOptions.enableParamsStashAndRecover;
      }
    }
  }

  return {
    start,
  }
})();
