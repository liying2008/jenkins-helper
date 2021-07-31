<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  mounted() {
    console.log('lifecycle: ', 'App mounted!')
  }
}
</script>
