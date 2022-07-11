<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('lifecycle: ', 'App mounted!')
})
</script>

<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
