<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  datetime?: string
}>()

const dateStr = computed(() => {
  if (!props.datetime) {
    return ''
  }
  return props.datetime.split(' ')[0]
})

const timeStr = computed(() => {
  if (!props.datetime) {
    return ''
  }
  return props.datetime.split(' ')[1]
})
</script>

<template>
  <div v-if="dateStr && timeStr">
    <span class="date-field">{{ dateStr }}</span>&nbsp;
    <span class="time-field">{{ timeStr }}</span>
  </div>
  <div v-else></div>
</template>

<style lang="scss" scoped>
.date-field {
  color: var(--jk-subtitle2);
}

.time-field {
  color: #888888;
}
</style>
