(function () {
  "use strict";
  redirect();

  // top.location="monitor.html";
  function redirect() {
    StorageService.getOptions(function (result) {
      if (result.defaultTab === 'monitor') {
        window.location.href = "monitor.html";
      } else if (result.defaultTab === 'params') {
        window.location.href = "params.html";
      } else {
        window.location.href = "monitor.html";
      }
    })
  }

})();
