<script lang="ts" setup>
import PreviewComponentStatusColor from './PreviewComponentStatusColor.vue'
import PreviewBasicInfo from './PreviewBasicInfo.vue'
import PreviewJobMonitorTable from './PreviewJobMonitorTable.vue'
import PreviewNodeMonitorTable from './PreviewNodeMonitorTable.vue'
</script>

<template>
  <div class="options-theme-preview-wrapper">
    <div>
      <PreviewBasicInfo />
    </div>
    <div style="margin-top: 16px;">
      <PreviewComponentStatusColor />
    </div>

    <n-card
      title="自定义色"
      embedded
      style="margin-top: 12px;"
    >
      <div>
        <a
          href="#"
          class="jk-a-link-color"
        >https://github.com/liying2008/jenkins-helper</a>
      </div>

      <div style="display: flex; white-space: break-spaces;">
        <h3 style="color: var(--jk-title);">
          title
        </h3>
        <h4 style="color: var(--jk-subtitle2);">
          subtitle2
        </h4>
        <h5 style="color: var(--jk-subtitle);">
          subtitle
        </h5>
      </div>

      <PreviewJobMonitorTable style="margin-top: 12px;" />

      <PreviewNodeMonitorTable style="margin-top: 12px;" />
    </n-card>

    <div style="margin-top: 12px;">
      &nbsp;
    </div>
  </div>
</template>

<style lang="scss">
.options-theme-preview-wrapper {
  padding: 24px;

  a {
    text-decoration: none;
  }

  .header-icon {
    font-size: 20px;
  }
}
</style>
