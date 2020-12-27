<template>
  <div id="api-tool-panel-body">
    <v-container>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  name: 'PanelBody'
})
export default class PanelBody extends Vue {
  strings = {
  }
}
</script>

<style lang="scss">
#api-tool-panel-body {
}
</style>
