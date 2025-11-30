/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import presetWind3 from '@unocss/preset-wind3'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'
import { getManifest } from './manifest.config'
import { name, version } from './package.json'

const r = (...args: string[]) => resolve(__dirname, ...args)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const productionMode = mode === 'production'
  return {
    resolve: {
      alias: {
        '~/': `${r('src')}/`,
      },
    },
    define: {
      __DEV__: !productionMode,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    plugins: [
      vue(),
      crx({ manifest: getManifest(mode) }),
      zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
      AutoImport({
        imports: [
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar',
            ],
          },
        ],
        dts: r('src/auto-imports.d.ts'),
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        dirs: [r('src/components')],
        // generate `components.d.ts` for ts support with Volar
        dts: r('src/components.d.ts'),
        resolvers: [NaiveUiResolver()],
      }),
      // https://github.com/unocss/unocss
      Unocss({
        presets: [
          presetWind3(),
        ],
      }),
    ],
    build: {
      emptyOutDir: true,
      outDir: productionMode ? 'dist-prod' : 'dist',
      sourcemap: productionMode ? false : 'inline',
      rollupOptions: {
        input: {
          computersManager: r('computers-manager.html'),
          jobStats: r('job-stats.html'),
          jenkinsTools: r('jenkins-tools.html'),
        },
      },
    },
    server: {
      cors: {
        origin: [
          /chrome-extension:\/\//,
        ],
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
  }
})
