<script lang="ts" setup>
import { useCssVar, useElementBounding } from '@vueuse/core'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  position: {
    type: String,
    required: false,
    default: 'bottom',
  },
  container: {
    type: String,
    required: false,
    default: 'body',
  },
})

const fixArea = ref<HTMLDivElement>()
// console.log('props.container', props.container)
const containerRef = ref<HTMLElement>()
const fixAreaLeftCssVar = useCssVar('--fix-area-left', containerRef)
const fixAreaWidthCssVar = useCssVar('--fix-area-width', containerRef)
const containerBounding = reactive(useElementBounding(containerRef))

watch(containerBounding, (newVal) => {
  if (newVal) {
    // console.log('newVal.left', newVal.left)
    // console.log('newVal.width', newVal.width)
    fixAreaWidthCssVar.value = `${newVal.width}px`
    fixAreaLeftCssVar.value = `${newVal.left}px`
  }
})

onMounted(() => {
  nextTick(() => {
    // 获取 container 元素
    containerRef.value = document.querySelector(props.container) as HTMLElement
    // 设置 fix position
    if (props.position === 'bottom') {
      fixArea.value!.style.bottom = '0'
    } else if (props.position === 'top') {
      fixArea.value!.style.top = '0'
    }
  })
})
</script>

<template>
  <div
    ref="fixArea"
    class="fix-area"
  >
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.fix-area {
  position: fixed;
  left: var(--fix-area-left);
  z-index: 90;
  align-items: center;
  width: var(--fix-area-width);
  text-align: center;
  vertical-align: middle;
}
</style>
