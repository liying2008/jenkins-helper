(function () {
  "use strict";

  var CMD_IS_ENABLE_STASH_AND_RECOVER = "is_enable_stash_and_recover";

  var message = {
    "cmd": CMD_IS_ENABLE_STASH_AND_RECOVER
  };
  browser.runtime.sendMessage(message).then(function (resp) {
    if (resp.code !== 0) {
      console.log('是否开启stash & recover 未知！');
      return
    }
    if (resp.data) {
      ParamsStashRecover.enable()
    }
  })
})();
