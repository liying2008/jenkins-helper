<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { t } from '~/libs/extension'

const strings = {
  settings: t('settings'),
  importAndExportSettings: t('importAndExportSettings'),
  about: t('about'),
}

const drawer = ref(true)

onMounted(() => {
  console.log('lifecycle: ', 'Sidebar mounted!')
})
</script>

<template>
  <v-card
    id="options-sidebar-wrapper"
    fill-height
  >
    <v-navigation-drawer
      v-model="drawer"
      fixed
      clipped
      permanent
      app
    >
      <v-list
        nav
        dense
      >
        <!-- 设置 -->
        <v-list-item
          link
          to="/settings"
        >
          <v-list-item-icon>
            <v-icon>mdi-cog-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ strings.settings }}</v-list-item-title>
        </v-list-item>
        <!-- 导入/导出设置 -->
        <v-list-item
          link
          to="/import-export"
        >
          <v-list-item-icon>
            <v-icon>mdi-file-import-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ strings.importAndExportSettings }}</v-list-item-title>
        </v-list-item>
        <!-- 关于 -->
        <v-list-item
          link
          to="/about"
        >
          <v-list-item-icon>
            <v-icon>mdi-information-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ strings.about }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-card>
</template>

<style scoped lang="scss">
</style>
