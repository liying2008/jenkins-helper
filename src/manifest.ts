import { defineManifest } from '@crxjs/vite-plugin'
import pkg from '../package.json'

export function getManifest(mode: string) {
  const productionMode = mode === 'production'
  let envTag = ''
  const envImgDir = 'icon'
  if (!productionMode) {
    envTag = '（开发模式）'
  }

  return defineManifest({
    manifest_version: 3,
    name: `__MSG_extName__${envTag}`,
    short_name: '__MSG_extShortName__',
    version: pkg.version,
    description: '__MSG_extDesc__',
    author: 'LiYing',
    homepage_url: 'https://github.com/liying2008/jenkins-helper',
    // browser_specific_settings: { // NOTE: @crxjs does not yet support firefox
    //   gecko: {
    //     id: 'jenkins.helper@duduhuo.cc',
    //     strict_min_version: '109',
    //   },
    // },
    minimum_chrome_version: '91',
    default_locale: 'en',
    omnibox: {
      keyword: 'jk',
    },
    action: {
      browser_style: false,
      default_icon: {
        19: `${envImgDir}/icon19.png`,
        38: `${envImgDir}/icon38.png`,
      },
      default_popup: 'popup.html',
      default_title: '__MSG_extShortName__ - __MSG_extDesc__',
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    background: {
      service_worker: 'src/background/main.ts',
      type: 'module',
    },
    icons: {
      16: `${envImgDir}/icon16.png`,
      48: `${envImgDir}/icon48.png`,
      128: `${envImgDir}/icon128.png`,
    },
    content_security_policy: {
      extension_pages: 'script-src \'self\'; object-src \'self\';',
      sandbox: 'sandbox allow-scripts allow-forms allow-popups allow-modals; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; child-src \'self\';',
    },
    permissions: [
      'storage',
      'alarms',
      'notifications',
      'tabs',
      'downloads',
    ],
    host_permissions: [
      'http://*/*',
      'https://*/*',
    ],
    content_scripts: [{
      matches: [
        'http://*/*',
        'https://*/*',
      ],
      js: ['src/contentScripts/index.ts'],
      run_at: 'document_end',
    }],
    web_accessible_resources: [
      {
        resources: [
          'css/style.css',
          'img/computer48.png',
          'img/logo.png',
          'img/logo-gray.png',
          'img/logo-green.png',
          'img/logo-red.png',
          'img/logo-yellow.png',
        ],
        matches: [
          'http://*/*',
          'https://*/*',
        ],
      },
    ],
  })
}
