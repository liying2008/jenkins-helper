<script lang="ts" setup>
import type { Component } from 'vue'
import { h, ref } from 'vue'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { AtOutline, ColorPaletteOutline, DocumentOutline, OptionsOutline } from '@vicons/ionicons5'
import { RouterLink } from 'vue-router'
import { t } from '~/libs/extension'

interface MenuItem {
  compName: string
  title: string
  icon: Component
}

const strings = {
  settings: t('settings'),
  importAndExportSettings: t('importAndExportSettings'),
  about: t('about'),
}

const menuItems: MenuItem[] = [
  {
    compName: 'Settings',
    title: strings.settings,
    icon: OptionsOutline,
  },
  {
    compName: 'ImportExport',
    title: strings.importAndExportSettings,
    icon: DocumentOutline,
  },
  {
    compName: 'About',
    title: strings.about,
    icon: AtOutline,
  },
]

console.log('__DEV__', __DEV__)

if (__DEV__) {
  // 开发模式下，添加 主题预览 的菜单项
  menuItems.push({
    compName: 'ThemePreview',
    title: '主题预览',
    icon: ColorPaletteOutline,
  })
}

const menuOptions: MenuOption[] = menuItems.map((menu) => {
  return {
    label: () => h(RouterLink, {
      to: {
        name: menu.compName,
      },
    }, { default: () => menu.title }),
    key: menu.compName,
    icon: renderIcon(menu.icon),
  }
})

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
