<script lang="ts" setup>
import { onMounted } from 'vue'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'

onMounted(() => {
  console.log('lifecycle: ', 'Layout mounted!')
})
</script>

<template>
  <v-app>
    <Header></Header>
    <nav>
      <Sidebar></Sidebar>
    </nav>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>
