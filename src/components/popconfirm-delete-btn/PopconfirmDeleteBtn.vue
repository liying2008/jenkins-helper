<script lang="ts" setup>
import type { Component } from 'vue'
import { t } from '~/libs/extension'

interface Props {
  text: string
  positiveText?: string
  negativeText?: string
  btnClass?: string
  btnTitle?: string
  btnStyle?: Record<string, unknown>
  icon: Component // Vue component type
  iconSize?: string
}

withDefaults(defineProps<Props>(), {
  positiveText: t('ok'),
  negativeText: t('cancel'),
  btnClass: '',
  btnTitle: '',
  btnStyle: () => ({}),
  iconSize: '',
})

const emit = defineEmits<{
  (e: 'positiveClick'): void
  (e: 'negativeClick'): void
}>()
</script>

<template>
  <n-popconfirm
    :positive-text="positiveText"
    :negative-text="negativeText"
    @positive-click="emit('positiveClick')"
    @negative-click="emit('negativeClick')"
  >
    <template #trigger>
      <n-button
        text
        :class="btnClass"
        :style="btnStyle"
        :title="btnTitle"
      >
        <n-icon
          :size="iconSize"
          :component="icon"
        >
        </n-icon>
      </n-button>
    </template>
    {{ text }}
  </n-popconfirm>
</template>

<style lang="scss">
</style>
