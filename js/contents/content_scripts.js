(function () {
  "use strict";

  var CMD_IS_ENABLE_STASH_AND_RECOVER = "is_enable_stash_and_recover";

  var startTime = Date.now();
  var message = {
    "cmd": CMD_IS_ENABLE_STASH_AND_RECOVER
  };
  chrome.runtime.sendMessage(message, function (resp) {
    console.log('cost time: ', Date.now() - startTime);
    if (resp.code !== 0) {
      console.log('是否开启stash & recover 未知！');
      return
    }
    if (resp.data) {
      ParamsStashRecover.enable()
    }
  })
})();
