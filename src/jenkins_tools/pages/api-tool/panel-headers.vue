<template>
  <div id="api-tool-panel-headers">
    <v-container>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  name: 'PanelHeaders'
})
export default class PanelHeaders extends Vue {
  strings = {
  }
}
</script>

<style lang="scss">
#api-tool-panel-headers {
}
</style>
