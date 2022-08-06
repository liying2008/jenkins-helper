<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { StorageService } from '~/libs/storage'

const themeName = ref('')
const enableDarkMode = ref(false)

onMounted(async () => {
  const options = await StorageService.getOptions()
  themeName.value = options.currentTheme
  enableDarkMode.value = options.enableDarkMode
})
</script>

<template>
  <n-card embedded>
    <div>当前主题：{{ themeName }}</div>
    <div>暗色模式：{{ enableDarkMode }}</div>
  </n-card>
</template>

<style scoped>

</style>
