<script lang="ts" setup>
import type { Component } from 'vue'
import { h, ref } from 'vue'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { AtOutline, DocumentOutline, OptionsOutline } from '@vicons/ionicons5'
import { RouterLink } from 'vue-router'
import { t } from '~/libs/extension'

const strings = {
  settings: t('settings'),
  importAndExportSettings: t('importAndExportSettings'),
  about: t('about'),
}


const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink,
      {
        to: {
          name: 'Settings',
        },
      },
      { default: () => strings.settings },
    ),
    key: 'settings',
    icon: renderIcon(OptionsOutline),
  },
  {
    label: () => h(RouterLink,
      {
        to: {
          name: 'ImportExport',
        },
      },
      { default: () => strings.importAndExportSettings },
    ),
    key: 'importAndExportSettings',
    icon: renderIcon(DocumentOutline),
  },
  {
    label: () => h(RouterLink,
      {
        to: {
          name: 'About',
        },
      },
      { default: () => strings.about },
    ),
    key: 'about',
    icon: renderIcon(AtOutline),
  },
]
const collapsed = ref(false)

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
</script>

<template>
  <div class="options-sidebar-wrapper">
    <n-layout-sider
      bordered
      class="sidebar"
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
      />
    </n-layout-sider>
  </div>
</template>

<style scoped lang="scss">
.options-sidebar-wrapper {
  aside {
    z-index: 9999;
    box-sizing: border-box;
    height: 100%;

    .sidebar {
      box-sizing: border-box;
      height: 100%;
      border-spacing: 0;
    }
  }
}
</style>
