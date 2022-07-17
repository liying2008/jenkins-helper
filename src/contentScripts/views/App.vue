<script lang="ts" setup>
import { useToggle } from '@vueuse/core'
import 'virtual:windi.css'

const [show, toggle] = useToggle(false)
</script>

<template>
  <div class="wrapper">
    <div
      class="bg-white text-gray-800 rounded-full shadow w-max h-min"
      p="x-4 y-2"
      m="y-auto r-2"
      transition="opacity duration-300"
      :class="show ? 'opacity-100' : 'opacity-0'"
    >
      Vitesse WebExt
    </div>
    <div
      class="flex w-10 h-10 rounded-full shadow cursor-pointer"
      bg="teal-600 hover:teal-700"
      @click="toggle()"
    >
      <pixelarticons-power class="block m-auto text-white text-lg" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  position: fixed;
  right: 0;
  bottom: 10px;
  z-index: 100;
  display: flex;
  margin: 20px;
  user-select: none;
}
</style>
