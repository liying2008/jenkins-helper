<template>
  <v-card
    id="jenkins-tools-sidebar-wrapper"
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
        <!-- API工具 -->
        <v-list-item
          link
          to="/api-tool"
        >
          <v-list-item-icon>
            <v-icon>mdi-api</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ strings.apiTool }}</v-list-item-title>
        </v-list-item>
        <!-- 任务迁移 -->
        <v-list-item
          link
          to="/job-migration"
        >
          <v-list-item-icon>
            <v-icon>mdi-database-import</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ strings.jobMigration }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Sidebar extends Vue {
  strings = {
    apiTool: browser.i18n.getMessage('apiTool'),
    jobMigration: browser.i18n.getMessage('jobMigration'),
  }
  drawer = true

  mounted() {
    console.log('lifecycle: ', 'Sidebar mounted!')
  }
}
</script>

<style lang="scss">
#jenkins-tools-sidebar-wrapper {
}
</style>
