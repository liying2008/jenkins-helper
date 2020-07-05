module.exports = {
  productionSourceMap: false,

  "transpileDependencies": [
    "vuetify"
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
    standalone: {
      template: 'public/browser-extension.html',
      entry: './src/standalone/main.ts',
      title: 'Standalone',
      filename: 'index.html'
    }
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
