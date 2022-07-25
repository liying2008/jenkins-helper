<script setup lang="ts">
import { NewspaperOutline } from '@vicons/ionicons5'
import { nextTick, onMounted, ref } from 'vue'
import { getMainPanelOffset } from '../libs/build-subpage'
import BuildInfoModal from '~/contentScripts/views/components/BuildInfoModal.vue'

const drawerVisible = ref(false)
const wrapper = ref<HTMLDivElement>()

onMounted(() => {
  const mainPanelOffset = getMainPanelOffset()
  console.log('mainPanelOffset', mainPanelOffset)
  nextTick(() => {
    wrapper.value!.style.top = `${mainPanelOffset.top + 20}px`
  })
})
function showBuildInfo() {
  drawerVisible.value = true
}
</script>

<template>
  <div
    ref="wrapper"
    class="wrapper"
  >
    <n-button
      strong
      secondary
      circle
      type="info"
      @click="showBuildInfo"
    >
      <template #icon>
        <n-icon><NewspaperOutline /></n-icon>
      </template>
    </n-button>
    <!-- TODO teleport 无效 -->
    <teleport :to="wrapper">
      <BuildInfoModal :visible="drawerVisible" />
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  position: fixed;
  top: 0;
  right: 20px;
  z-index: 200;
  display: flex;
  margin: 20px;
  user-select: none;
}
</style>
