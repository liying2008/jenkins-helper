<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {

}
</script>

<style scoped lang="scss">
#app {
  min-height: 200px;
  /*设置 min-width 之后，Firefox上会有横向滚动条*/
  /*min-width: 700;*/
  width: 700px;
  margin: auto;
}
</style>
