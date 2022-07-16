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
      <n-layout class="main-container">
        <router-view></router-view>
      </n-layout>
    </n-layout>
  </div>
</template>

<style lang="scss">
.layout-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;

  .main {
    width: 100%;
    height: 100%;
    clear: both;

    .main-container {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
