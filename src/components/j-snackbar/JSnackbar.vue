<template>
  <v-snackbar
    v-model="snackbarData.show"
    :color="snackbarData.color"
    :bottom="snackbarData.bottom"
    :centered="snackbarData.centered"
    :left="snackbarData.left"
    :right="snackbarData.right"
    :top="snackbarData.top"
  >
    {{ snackbarData.message }}

    <template v-slot:action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="snackbarData.show = false"
      >
        {{ strings.close }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { SnackbarData } from '@/models/message'
import { Vue, Component, Prop } from 'vue-property-decorator'


@Component({
  name: 'JSnackbar'
})
export default class JSnackbar extends Vue {
  @Prop({ type: SnackbarData, required: true }) snackbarData!: SnackbarData

  strings = {
    close: browser.i18n.getMessage('close'),
  }
}
</script>
