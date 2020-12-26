<template>
  <v-app-bar
    id="jenkins-tools-header-wrapper"
    app
    fixed
    clipped-left
    color="primary"
    dark
  >
    <v-img
      alt="Logo"
      class="shrink mr-6"
      contain
      src="img/logo.svg"
      transition="scale-transition"
      width="40"
    />
    <v-toolbar-title>Jenkins Tools</v-toolbar-title>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Header extends Vue {
  strings = {
    extName: browser.i18n.getMessage('extName')
  }

  mounted() {
    console.log('lifecycle: ', 'Header mounted!')
  }
}
</script>

<style lang="scss">
#jenkins-tools-header-wrapper {
}
</style>
