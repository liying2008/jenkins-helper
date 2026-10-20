<!-- Popup 和 ContentScripts 共用组件，不要依赖 unocss、store、router 和 不支持的API -->
<script setup lang="ts">
import type { DisplayedBadge } from '~/libs/jenkins/build'

interface Props {
  badges: DisplayedBadge[]
}

const props = defineProps<Props>()
</script>

<template>
  <n-space>
    <n-tag
      v-for="badge, index in badges"
      :key="index"
      :type="badge.type === 'html' ? 'default' : badge.type"
      size="small"
      round
    >
      <div v-if="badge.type === 'html'">
        <div v-html="badge.html"></div>
      </div>
      <div v-else>
        <a
          v-if="badge.link"
          :href="badge.link"
          target="_blank"
        >{{ badge.text }}</a>
        <span v-else>{{ badge.text }}</span>
      </div>
    </n-tag>
  </n-space>
</template>

<style lang="scss" scoped>
</style>
