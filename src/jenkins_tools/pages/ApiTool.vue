<template>
  <div id="api-tool-wrapper">
    <v-container>
      <div
        class="mx-auto mt-2"
        style="max-width: 900px;"
      >
      </div>
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
      >
        {{ snackbar.message }}

        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="snackbar.show = false"
          >
            {{ strings.close }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { MessageColor } from '@/models/message'

@Component
export default class Settings extends Vue {
  strings = {
  }
  snackbar = {
    show: false,
    message: '',
    color: MessageColor.Success,
  }
}
</script>

<style lang="scss">
#api-tool-wrapper {
}
</style>
