import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Unocss from 'unocss/vite'
import presetUno from '@unocss/preset-uno'
import { isDev, r } from './scripts/utils'
import { getManifest } from './src/manifest'

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
      __DEV__: isDev,
    },
    plugins: [
      vue(),
      crx({ manifest: getManifest(mode) }),
      AutoImport({
        imports: [
          {
            'webextension-polyfill': [
              ['*', 'browser'],
            ],
          },
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
          presetUno(),
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
    test: {
      globals: true,
      environment: 'jsdom',
    },
  }
})
