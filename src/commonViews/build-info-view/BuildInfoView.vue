<!-- Popup 和 ContentScripts 共用组件，不要依赖 unocss、store、router 和 不支持的API -->
<script setup lang="ts">
import { ArrowForwardCircleSharp, CopyOutline, FlagSharp, FlashSharp, TimeSharp } from '@vicons/ionicons5'
import { useClipboard } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import { watch } from 'vue'
import { t } from '~/libs/extension'
import type { DisplayedBuildCause } from '~/libs/jenkins/build'

interface Props {
  buildUrl: string
  fullDisplayName: string
  builtOn: string
  building: boolean
  buildResult: string
  buildTime: string
  causes: DisplayedBuildCause[]
  darkMode: boolean
}

const props = defineProps<Props>()

const strings = {
  buildStatus_: t('buildStatus_'),
  runLabel_: t('runLabel_'),
  copied: t('copied'),
  building: 'BUILDING',
}

const message = useMessage()
const clipboard = useClipboard({ source: props.builtOn })

watch(clipboard.copied, (value) => {
  if (value) {
    message.success(strings.copied)
  }
})

function getResultColor(label: string) {
  switch (label) {
    case 'SUCCESS': return 'success'
    case 'FAILURE': return 'error'
    case 'UNSTABLE': return 'warning'
    case 'ABORTED': return 'aborted'
    default: return ''
  }
}

// 复制运行节点
function copyBuiltOn() {
  if (!clipboard.isSupported) {
    message.error('Your browser does not support clipboard')
    return
  }
  clipboard.copy()
}
</script>

<template>
  <n-card class="info-block">
    <!-- Display name & 构建状态 -->
    <n-grid
      x-gap="12"
      :cols="2"
      class="info-row"
    >
      <n-gi class="info-col">
        <n-icon
          title="Full DisplayName"
          size="16"
        >
          <FlagSharp />
        </n-icon>
        <a
          :href="buildUrl"
          target="_blank"
          style="margin-left: 8px;"
          class="display-name jk-a-link-color"
        >{{ fullDisplayName }}</a>
      </n-gi>
      <n-gi class="info-col">
        {{ strings.buildStatus_ }}
        <!-- 构建中 -->
        <n-tag
          v-if="building"
          :color="{ color: darkMode ? 'var(--jk-infoColorPressed)' : 'var(--jk-infoColor)', textColor: 'white' }"
          class="build-tag building"
          size="small"
          round
          strong
          :bordered="false"
        >
          {{ strings.building }}
        </n-tag>
        <!-- 构建已完成 -->
        <n-tag
          v-else
          :color="{ color: `var(--jk-${getResultColor(buildResult)})`, textColor: 'white' }"
          size="small"
          round
          strong
          :bordered="false"
          class="build-tag"
        >
          {{ buildResult }}
        </n-tag>
      </n-gi>
    </n-grid>
    <!-- 构建时间 & 执行节点 -->
    <n-grid
      x-gap="12"
      :cols="2"
      class="info-row"
    >
      <n-gi class="info-col">
        <n-icon
          size="16"
          title="Build Timestamp"
        >
          <TimeSharp />
        </n-icon>
        <span style="margin-left: 8px;">{{ buildTime }}</span>
      </n-gi>
      <n-gi
        v-show="builtOn"
        class="info-col"
      >
        {{ strings.runLabel_ }}<span>{{ builtOn }}</span>
        <n-button
          v-show="builtOn"
          text
          class="copy-icon-btn"
          title="Copy"
          @click="copyBuiltOn"
        >
          <template #icon>
            <n-icon size="16px">
              <CopyOutline class="copy-built-on-icon" />
            </n-icon>
          </template>
        </n-button>
      </n-gi>
    </n-grid>
    <!-- Build Causes -->
    <n-grid
      v-for="(cause, index) in causes"
      :key="index"
      :cols="1"
      class="info-row"
    >
      <n-gi
        cols="12"
        class="info-col"
      >
        <n-icon
          size="16"
          title="Build Cause"
        >
          <FlashSharp />
        </n-icon>
        <span style="margin-left: 8px;">{{ cause.shortDescription }}</span>
        <n-button
          v-if="cause.fullUpstreamUrl"
          class="go-icon-btn"
          title="Go"
          tag="a"
          :href="cause.fullUpstreamUrl"
          text
          target="_blank"
        >
          <n-icon size="17px">
            <ArrowForwardCircleSharp />
          </n-icon>
        </n-button>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<style lang="scss" scoped>
.info-block {
  padding: 4px 10px;

  :deep(.n-card__content) {
    padding: 0;
  }

  .info-row {
    align-items: center;
    margin: 6px 0;

    .info-col {
      align-items: center;
      font-size: 12px;

      .n-icon {
        vertical-align: middle;
      }

      .display-name {
        text-decoration-line: none;
        word-break: break-all;
        word-wrap: break-word;
      }

      .build-tag {
        transform: scale(0.8);
      }

      .building {
        animation-name: building;
        animation-duration: 1.4s;
        animation-play-state: running;
        animation-timing-function: ease-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        animation-fill-mode: none;
      }

      @keyframes building {
        0% {
          opacity: 1;
        }

        100% {
          opacity: 0.3;
        }
      }

      .copy-icon-btn {
        margin-left: 8px;
        vertical-align: middle;

        .copy-built-on-icon {
          font-size: 14px;
        }
      }

      .go-icon-btn {
        margin-left: 8px;
        vertical-align: sub;
      }
    }
  }
}
</style>
