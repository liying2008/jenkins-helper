module.exports = {
  devServer: {
    disableHostCheck: true
  },
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,

  'transpileDependencies': [
    'vuetify'
  ],

  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'Popup'
    },
    options: {
      template: 'public/browser-extension.html',
      entry: './src/options/main.ts',
      title: 'Options'
    },
    computersManager: {
      template: 'public/browser-extension.html',
      entry: './src/computers_manager/main.ts',
      title: 'Jenkins Computer Monitor Manager',
      filename: 'computers_manager.html'
    },
    jobStats: {
      template: 'public/browser-extension.html',
      entry: './src/job_stats/main.ts',
      title: 'Jenkins Job Statistics',
      filename: 'job_stats.html'
    },
    jenkinsTools: {
      template: 'public/browser-extension.html',
      entry: './src/jenkins_tools/main.ts',
      title: 'Jenkins Tools',
      filename: 'jenkins_tools.html'
    },
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background/background.ts'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.ts'
            ]
          }
        }
      }
    }
  }
}
