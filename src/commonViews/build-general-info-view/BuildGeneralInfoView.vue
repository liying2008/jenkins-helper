<!-- Popup 和 ContentScripts 共用组件，不要依赖 unocss、store、router 和 不支持的API -->
<script setup lang="ts">
import type { BuildCause, InterruptionCause } from '~/models/jenkins/build'
import { CopyOutline, FlagSharp, HammerSharp, LaptopSharp, StopSharp, TimeSharp } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { t } from '~/libs/extension'

interface Props {
  buildUrl: string
  fullDisplayName: string
  builtOn?: string
  building: boolean
  buildResult: string | null
  timestamp: number
  duration: number
  causes: BuildCause[]
  interruptionCauses: InterruptionCause[]
  darkMode: boolean
}

const props = defineProps<Props>()

const strings = {
  copied: t('copied'),
  copyFailed: t('copyFailed'),
  building: 'BUILDING',
}

const message = useMessage()

const wrapperRef = ref<HTMLElement | null>(null)

const startTime = computed(() => {
  return new Date(props.timestamp).toLocaleString()
})

const durationStr = computed(() => {
  return formatDuration(props.duration)
})

const endTime = computed(() => {
  // 构建尚未结束（duration 为 0）时不计算结束时间
  if (props.building || props.duration <= 0) {
    return ''
  }
  return new Date(props.timestamp + props.duration).toLocaleString()
})

const timeDisplay = computed(() => {
  if (!endTime.value) {
    return startTime.value
  }
  return `${startTime.value} —— ${endTime.value}`
})

// 将毫秒转换为人类易读的时间字符串，如 1d 2h 3m 4s
function formatDuration(ms: number): string {
  if (!ms || ms <= 0) {
    return '0s'
  }
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []
  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`)
  }
  return parts.join(' ')
}

function getResultColor(label: string | null) {
  switch (label) {
    case 'SUCCESS': return 'success'
    case 'FAILURE': return 'error'
    case 'UNSTABLE': return 'warning'
    case 'ABORTED': return 'aborted'
    default: return ''
  }
}

// 用临时 textarea + execCommand 兜底，兼容 http 页面与 Content Script 环境
function legacyCopy(text: string): boolean {
  console.log('legacyCopy', text)
  const activeElement = document.activeElement as HTMLElement | null
  const selection = document.getSelection()
  const ranges: Range[] = []
  if (selection) {
    for (let i = 0; i < selection.rangeCount; i++) {
      ranges.push(selection.getRangeAt(i))
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  if (!wrapperRef.value) {
    return false
  }
  // 备注：此处如果使用 document.body.appendChild(textarea)，则 content scripts 环境下复制无效（不报错，但是也没复制成功）
  wrapperRef.value.appendChild(textarea)

  let succeeded = false
  try {
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    succeeded = document.execCommand('copy')
  } catch {
    succeeded = false
  } finally {
    textarea.remove()
    // 恢复宿主页面原有的焦点与选区
    activeElement?.focus()
    if (selection && ranges.length > 0) {
      selection.removeAllRanges()
      ranges.forEach((range) => selection.addRange(range))
    }
  }
  return succeeded
}

// 优先使用 writeText（比 ClipboardItem 兼容性更好），失败则回退到 execCommand
async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 非安全上下文、权限被拒或页面未聚焦时，回退到兼容性更好的方式
      return legacyCopy(text)
    }
  }
  return legacyCopy(text)
}

// 复制运行节点
async function copyBuiltOn() {
  const text = props.builtOn?.trim()
  if (!text) {
    return
  }
  const succeeded = await copyText(text)
  if (succeeded) {
    message.success(strings.copied)
  } else {
    message.error(strings.copyFailed)
  }
}
</script>

<template>
  <div ref="wrapperRef">
    <n-card class="info-block">
      <!-- Display name & 构建状态 -->
      <n-grid
        :cols="1"
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
            class="icon-gap display-name jk-a-link-color"
          >{{ fullDisplayName }}</a>
          <div style="margin-left: 8px;">
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
          </div>
        </n-gi>
      </n-grid>
      <!-- 构建时间 -->
      <n-grid
        :cols="1"
        class="info-row"
      >
        <n-gi class="info-col">
          <n-icon
            size="16"
            title="Build Time"
          >
            <TimeSharp />
          </n-icon>
          <span class="icon-gap build-time">{{ timeDisplay }}</span>
          <span
            v-if="endTime"
            class="build-duration"
          >({{ durationStr }})</span>
        </n-gi>
      </n-grid>
      <!-- 执行节点 -->
      <n-grid
        v-if="builtOn"
        :cols="1"
        class="info-row"
      >
        <n-gi class="info-col">
          <n-icon
            size="16"
            title="Built On"
          >
            <LaptopSharp />
          </n-icon>
          <span class="icon-gap">{{ builtOn }}</span>
          <n-button
            v-if="builtOn"
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
            <HammerSharp />
          </n-icon>
          <span class="icon-gap">{{ cause.shortDescription }}</span>
        </n-gi>
      </n-grid>
      <!-- Interruption Causes -->
      <n-grid
        v-for="(cause, index) in interruptionCauses"
        :key="index"
        :cols="1"
        class="info-row"
      >
        <n-gi
          cols="12"
          class="info-col"
          style="color: var(--jk-aborted)"
        >
          <n-icon
            size="16"
            title="Interruption Cause"
          >
            <StopSharp />
          </n-icon>
          <span class="icon-gap">{{ cause.shortDescription }}</span>
        </n-gi>
      </n-grid>
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
.info-block {
  padding: 4px 10px;

  :deep(.n-card-content) {
    padding: 0 !important;
  }

  .info-row {
    align-items: center;
    margin: 6px 0;

    .info-col {
      display: flex;
      align-items: center;
      font-size: 12px;

      .n-icon {
        vertical-align: middle;
      }

      .icon-gap {
        margin-left: 8px;
      }

      .display-name {
        word-break: break-all;
        overflow-wrap: break-word;
        text-decoration-line: none;
      }

      .build-tag {
        transform: scale(0.8);
      }

      .building {
        animation-name: building;
        animation-duration: 1.4s;
        animation-timing-function: ease-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        animation-fill-mode: none;
        animation-play-state: running;
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

      .build-time {
        word-break: break-all;
      }

      .build-duration {
        margin-left: 8px;
        color: var(--jk-subtitle);
      }

      .go-icon-btn {
        margin-left: 8px;
        vertical-align: sub;
      }
    }
  }
}
</style>
