<template>
  <v-app id="job-stats-wrapper">
  </v-app>
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
<style lang="scss">
#job-stats-wrapper {
}
</style>
