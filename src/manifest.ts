import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
import { isDev, port, r } from '../scripts/utils'

export async function getManifest() {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 2,
    name: '__MSG_extName__',
    short_name: '__MSG_extShortName__',
    version: pkg.version,
    description: '__MSG_extDesc__',
    author: 'LiYing',
    homepage_url: 'https://github.com/liying2008/jenkins-helper',
    applications: {
      gecko: {
        id: 'jenkins.helper@duduhuo.cc',
        strict_min_version: '57.0',
      },
    },
    minimum_chrome_version: '55',
    default_locale: 'en',
    omnibox: {
      keyword: 'jk',
    },
    browser_action: {
      browser_style: false,
      default_icon: {
        19: 'img/icon19.png',
        38: 'img/icon38.png',
      },
      default_popup: './dist/popup/index.html',
      default_title: '__MSG_extShortName__ - __MSG_extDesc__',
    },
    options_ui: {
      page: './dist/options/index.html',
      open_in_tab: true,
      chrome_style: false,
    },
    background: {
      page: './dist/background/index.html',
    },
    icons: {
      16: 'img/icon16.png',
      48: 'img/icon48.png',
      128: 'img/icon128.png',
    },
    content_security_policy: 'script-src \'self\' \'unsafe-eval\'; object-src \'self\'',
    permissions: [
      'http://*/*',
      'https://*/*',
      'storage',
      'notifications',
      'tabs',
      'downloads',
    ],
    content_scripts: [{
      matches: [
        'http://*/*',
        'https://*/*',
      ],
      js: ['./dist/contentScripts/index.global.js'],
      run_at: 'document_end',
    }],
    web_accessible_resources: [
      'dist/contentScripts/style.css',
    ],
  }

  if (isDev) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts
    manifest.permissions?.push('webNavigation')

    // this is required on dev for Vite script to load
    manifest.content_security_policy = `script-src \'self\' http://localhost:${port}; object-src \'self\'`
  }

  return manifest
}
