<script lang="ts" setup>
defineProps({
  text: {
    type: String,
  },
  positiveText: {
    type: String,
    required: false,
    default: browser.i18n.getMessage('ok'),
  },
  negativeText: {
    type: String,
    required: false,
    default: browser.i18n.getMessage('cancel'),
  },
  btnClass: {
    type: String,
    required: false,
    default: '',
  },
  btnTitle: {
    type: String,
    required: false,
    default: '',
  },
  btnStyle: {
    type: Object,
    default: () => ({}),
  },
  icon: {
    type: Object,
    required: true,
  },
  iconSize: {
    type: String,
    required: false,
    default: '',
  },
})

// eslint-disable-next-line func-call-spacing
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
