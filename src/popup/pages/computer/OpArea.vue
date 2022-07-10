<script lang="ts" setup>
import { ref, watch } from 'vue'
import { NotificationsOutline, RefreshSharp, SearchOutline } from '@vicons/ionicons5'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { watchDebounced } from '@vueuse/core'
import { ComputerStatus, openNodesManager } from './common'
import { StorageService } from '~/libs/storage'
import type { Options } from '~/models/option'
import { NodeService } from '~/background/node-service'
import { t } from '~/libs/extension'

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
  filterByNodeDisplayName: t('filterByNodeDisplayName'),
  showOfflineNodes: t('showOfflineNodes'),
  filterLabel: t('filterLabel'),
}

const filteringResult = ref(ComputerStatus.All)
const filteringDisplayName = ref('')
const filteringResults: SelectMixedOption[] = []
const showOfflineNodes = ref(true)


watch(showOfflineNodes, (newVal: boolean) => {
  // TODO 持久化存储此项配置
  StorageService.getOptions().then((options: Options) => {
    // console.log('showOfflineNodesChange', options)
    options.showDisabledJobs = newVal
    StorageService.saveOptions(options)
    emit('showOfflineNodesChange', newVal)
  })
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
    />
    <!-- 是否显示离线的节点 -->
    <n-checkbox
      v-model:checked="showOfflineNodes"
      size="small"
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
