<script lang="ts" setup>
import { onMounted } from 'vue'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'

onMounted(() => {
  console.log('lifecycle: ', 'Layout mounted!')
})
</script>

<template>
  <div class="layout-wrapper">
    <Header></Header>
    <n-layout
      has-sider
      class="main mt-56px"
    >
      <Sidebar></Sidebar>
      <n-layout>
        <router-view></router-view>
      </n-layout>
    </n-layout>
  </div>
</template>

<style lang="scss">
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;

  .main {
    flex: 1;
  }
}
</style>
