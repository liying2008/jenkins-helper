<script lang="ts" setup>
import { onMounted } from 'vue'
import { t } from '~/libs/extension'

const strings = {
  extName: t('extName'),
}

onMounted(() => {
  console.log('lifecycle: ', 'Header mounted!')
})
</script>

<template>
  <v-app-bar
    id="options-header-wrapper"
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
    <v-toolbar-title>{{ strings.extName }}</v-toolbar-title>
  </v-app-bar>
</template>

<style scoped lang="scss">
</style>
