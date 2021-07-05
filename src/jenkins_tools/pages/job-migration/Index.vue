<template>
  <div id="job-migration-wrapper">
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
import { MessageColor, SnackbarData } from '@/models/message'

@Component
export default class Index extends Vue {
  strings = {
    close: browser.i18n.getMessage('close'),
  }
  snackbar = SnackbarData.empty()

}
</script>

<style lang="scss">
#job-migration-wrapper {
}
</style>
