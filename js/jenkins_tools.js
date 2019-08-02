new Vue({
  el: '#app',
  data: {
    strings: {
      monitor: browser.i18n.getMessage("monitor"),
      params: browser.i18n.getMessage("params"),
      computer: browser.i18n.getMessage("computer"),
      tools: browser.i18n.getMessage("tools"),
    },
  },
  mounted() {

  },
  methods: {
    openOptions() {
      if (browser.runtime.openOptionsPage) {
        browser.runtime.openOptionsPage(); // Chrome 42+, Firefox 48
      } else {
        browser.tabs.create({'url': browser.runtime.getURL('options.html')});
      }
    },
    openJobList() {
      browser.windows.create({
        url: 'job_stats.html',
        type: 'popup',
        width: 1200,
        height: 800,
      }).then(function (window) {
        console.log('window', window)
      })
    },
  }
});
