<script lang="ts" setup>
import { ref } from 'vue'
import { t } from '~/libs/extension'
import { SnackbarData } from '~/models/message'

const props = defineProps({
  snackbarData: {
    type: SnackbarData,
    required: true,
  },
})

const strings = {
  close: t('close'),
}

const isShow = ref(props.snackbarData.show)
</script>

<template>
  <v-snackbar
    v-model="isShow"
    :color="snackbarData.color"
    :bottom="snackbarData.bottom"
    :centered="snackbarData.centered"
    :left="snackbarData.left"
    :right="snackbarData.right"
    :top="snackbarData.top"
  >
    {{ snackbarData.message }}

    <template #action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="isShow = false"
      >
        {{ strings.close }}
      </v-btn>
    </template>
  </v-snackbar>
</template>
