(function () {
  "use strict";

  // NOTE:
  // 1、如果开启 Windows 10 系统的专注助手，则 Chrome 通知不会在屏幕右下角弹出，而是收在通知中心里面。

  // 是否允许显示通知
  chrome.notifications.getPermissionLevel(function (level) {
    console.log('PermissionLevel', level)
  });
  ContentServices.start();
  JobServices.start();
  NodeServices.start();
})();
