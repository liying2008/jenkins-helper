<script setup lang="ts">
import { FlowerOutline } from '@vicons/ionicons5'
import { nextTick, onMounted, ref } from 'vue'
import BuildInfoModal from '~/contentScripts/views/components/BuildInfoModal.vue'
import { getMainPanelOffset } from '../libs/build-subpage'

const drawerVisible = ref(false)
const wrapper = ref<HTMLDivElement>()

onMounted(() => {
  const mainPanelOffset = getMainPanelOffset()
  console.log('mainPanelOffset', mainPanelOffset)
  nextTick(() => {
    wrapper.value!.style.top = `${mainPanelOffset.top + 40}px`
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
        <n-icon><FlowerOutline /></n-icon>
      </template>
    </n-button>

    <BuildInfoModal
      :visible="drawerVisible"
      @close="drawerVisible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 200;
  display: flex;
  margin: 10px;
  user-select: none;
}
</style>
