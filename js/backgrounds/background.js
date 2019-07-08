(function () {
  "use strict";

  var CMD_STASH_PARAMS = "stash_params";
  var CMD_RECOVER_PARAMS = "recover_params";
  var KEY_STASHED_PARAMS = "stashed_params";


  // NOTE:
  // 1、如果开启 Windows 10 系统的专注助手，则 Chrome 通知不会在屏幕右下角弹出，而是收在通知中心里面。

  // 是否允许显示通知
  chrome.notifications.getPermissionLevel(function (level) {
    console.log('PermissionLevel', level)
  });
  Services.start();
  NodeServices.start();

  // 处理来自 content_scripts 的消息
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log('request', request);
    // console.log('sender', sender);
    if (request.cmd === CMD_STASH_PARAMS) {
      // 保存参数
      localStorage.setItem(KEY_STASHED_PARAMS, JSON.stringify(request.data));
      sendResponse({"code": 0});
    } else if (request.cmd === CMD_RECOVER_PARAMS) {
      var params = JSON.parse(localStorage.getItem(KEY_STASHED_PARAMS));
      sendResponse({"code": 0, "data": params});
    }
  });
})();
