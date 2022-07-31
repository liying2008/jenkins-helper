<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { NotificationsOutline, RefreshSharp, SearchOutline } from '@vicons/ionicons5'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { watchDebounced } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import { ComputerStatus, openNodesManager } from './common'
import { NodeService } from '~/background/node-service'
import { t } from '~/libs/extension'

const props = defineProps({
  showOfflineNodes: {
    type: Boolean,
    required: true,
    default: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'resultFilterChange', value: number): void
  (e: 'displayNameFilterChange', value: string): void
  (e: 'showOfflineNodesChange', value: boolean): void
}>()

const strings = {
  noFilterValue: '-',
  normal: t('normal'),
  abnormal: t('abnormal'),
  manageMonitoredNodes: t('manageMonitoredNodes'),
  refreshNodesInfo: t('refreshNodesInfo'),
  notifiedRefreshService: t('notifiedRefreshService'),
  filterByNodeDisplayName: t('filterByNodeDisplayName'),
  showOfflineNodes: t('showOfflineNodes'),
  filterLabel: t('filterLabel'),
}

const message = useMessage()

const filteringResult = ref(ComputerStatus.All)
const filteringDisplayName = ref('')
const filteringResults: SelectMixedOption[] = []

const editableShowOfflineNodes = computed({
  get() {
    return props.showOfflineNodes
  },
  set(newVal: boolean) {
    emit('showOfflineNodesChange', newVal)
  },
})

watchDebounced(filteringDisplayName,
  () => {
    emit('displayNameFilterChange', filteringDisplayName.value)
  },
  { debounce: 300, maxWait: 500 },
)

watch(filteringResult, (newVal: number) => {
  emit('resultFilterChange', newVal)
})

initResultFilter()

/**
 * 初始化结果过滤器
 */
function initResultFilter() {
  // 默认不过滤
  filteringResult.value = ComputerStatus.All
  const filteringItems = [
    {
      label: strings.noFilterValue,
      value: ComputerStatus.All,
    },
    {
      label: strings.normal,
      value: ComputerStatus.Normal,
    },
    {
      label: strings.abnormal,
      value: ComputerStatus.Abnormal,
    },
  ]
  filteringResults.push(...filteringItems)
}
// 刷新节点信息
function refreshNodesInfo() {
  NodeService.queryNodeStatus()
  message.success(strings.notifiedRefreshService)
}
</script>

<template>
  <div class="node-op-area">
    <!-- 按节点名称过滤 -->
    <n-input
      v-model:value="filteringDisplayName"
      :placeholder="strings.filterByNodeDisplayName"
      class="search-input"
      size="small"
      clearable
      :disabled="disabled"
    >
      <template #prefix>
        <n-icon :component="SearchOutline" />
      </template>
    </n-input>
    <!-- 按结果过滤节点 -->
    <n-select
      v-model:value="filteringResult"
      size="small"
      class="filter-select"
      :placeholder="strings.filterLabel"
      :options="filteringResults"
      :disabled="disabled"
    />
    <!-- 是否显示离线的节点 -->
    <n-checkbox
      v-model:checked="editableShowOfflineNodes"
      size="small"
      :disabled="disabled"
      class="show-offline-checkbox items-center flex-1"
    >
      {{ strings.showOfflineNodes }}
    </n-checkbox>
    <!-- 管理监控节点按钮 -->
    <div>
      <n-button
        circle
        size="small"
        type="primary"
        class="ml-10px"
        :title="strings.manageMonitoredNodes"
        @click="openNodesManager('')"
      >
        <template #icon>
          <n-icon><NotificationsOutline /></n-icon>
        </template>
      </n-button>
      <n-button
        circle
        size="small"
        type="primary"
        class="ml-8px"
        :title="strings.refreshNodesInfo"
        @click="refreshNodesInfo"
      >
        <template #icon>
          <n-icon><RefreshSharp /></n-icon>
        </template>
      </n-button>
    </div>
  </div>
</template>

<style lang="scss">
  .node-op-area {
    display: flex;

    .search-input {
      width: 40%;
    }

    .filter-select {
      width: 16%;
      margin-left: 10px;
    }

    .show-offline-checkbox {
      margin-left: 10px;
    }
  }
</style>
