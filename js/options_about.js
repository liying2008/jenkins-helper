new Vue({
  el: '#app',
  data: {
    strings: {
      extName: browser.i18n.getMessage("extName"),
      settings: browser.i18n.getMessage("settings"),
      importAndExportSettings: browser.i18n.getMessage("importAndExportSettings"),
      about: browser.i18n.getMessage("about"),
    },
  },
});
