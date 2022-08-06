<script setup lang="ts">
import { useMessage, useNotification } from 'naive-ui'
import { Briefcase, Leaf, Options as OptionsIcon } from '@vicons/ionicons5'


const message = useMessage()
const notification = useNotification()
</script>

<template>
  <n-card
    title="组件状态色"
    embedded
  >
    <n-space>
      <n-button>Default</n-button>
      <n-button type="tertiary">
        Tertiary
      </n-button>
      <n-button type="primary">
        Primary
      </n-button>
      <n-button
        type="info"
        @click="message.info('Info message')"
      >
        Info
      </n-button>
      <n-button
        type="success"
        @click="message.success('Success message')"
      >
        Success
      </n-button>
      <n-button
        type="warning"
        @click="message.warning('Warning message')"
      >
        Warning
      </n-button>
      <n-button
        type="error"
        @click="message.error('Error message')"
      >
        Error
      </n-button>

      <n-divider vertical />

      <n-button
        strong
        secondary
      >
        Default
      </n-button>
      <n-button
        strong
        secondary
        type="tertiary"
      >
        Tertiary
      </n-button>
      <n-button
        strong
        secondary
        type="primary"
      >
        Primary
      </n-button>
      <n-button
        strong
        secondary
        type="info"
        @click="notification.info({
          content: '说点啥呢',
          meta: '想不出来',
          duration: 2500,
          keepAliveOnHover: true,
        })"
      >
        Info
      </n-button>
      <n-button
        strong
        secondary
        type="success"
        @click="notification.success({
          content: '说点啥呢',
          meta: '想不出来',
          duration: 2500,
          keepAliveOnHover: true,
        })"
      >
        Success
      </n-button>
      <n-button
        strong
        secondary
        type="warning"
        @click="notification.warning({
          content: '说点啥呢',
          meta: '想不出来',
          duration: 2500,
          keepAliveOnHover: true,
        })"
      >
        Warning
      </n-button>
      <n-button
        strong
        secondary
        type="error"
        @click="notification.error({
          content: '说点啥呢',
          meta: '想不出来',
          duration: 2500,
          keepAliveOnHover: true,
        })"
      >
        Error
      </n-button>
    </n-space>

    <n-space style="margin-top: 12px;">
      <n-tag> 爱在西元前 </n-tag>
      <n-tag type="success">
        不该
      </n-tag>
      <n-tag type="warning">
        超人不会飞
      </n-tag>
      <n-tag type="error">
        手写的从前
      </n-tag>
      <n-tag type="info">
        哪里都是你
      </n-tag>

      <n-divider vertical />

      <n-tag :bordered="false">
        爱在西元前
      </n-tag>
      <n-tag
        :bordered="false"
        type="success"
      >
        不该
      </n-tag>
      <n-tag
        :bordered="false"
        type="warning"
      >
        超人不会飞
      </n-tag>
      <n-tag
        :bordered="false"
        type="error"
      >
        手写的从前
      </n-tag>
      <n-tag
        :bordered="false"
        type="info"
      >
        哪里都是你
      </n-tag>
    </n-space>

    <n-space style="margin-top: 12px;">
      <n-button
        text
        class="header-icon"
        title="Open job statistics page"
      >
        <n-icon><Leaf /></n-icon>
      </n-button>

      <n-button
        text
        class="header-icon"
        title="Open Jenkins tools page"
      >
        <n-icon><Briefcase /></n-icon>
      </n-button>

      <n-button
        text
        class="header-icon"
        title="Open options page"
      >
        <n-icon><OptionsIcon /></n-icon>
      </n-button>
    </n-space>
  </n-card>
</template>

<style scoped>

</style>
