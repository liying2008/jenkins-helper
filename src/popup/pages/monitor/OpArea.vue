<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Add, SearchOutline } from '@vicons/ionicons5'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { watchDebounced } from '@vueuse/core'
import CreationModal from './CreationModal.vue'
import { Tools } from '~/libs/tools'
import { StorageService } from '~/libs/storage'
import type { Options } from '~/models/option'

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'resultFilterChange', value: string): void
  (e: 'jobNameFilterChange', value: string): void
  (e: 'showDisabledJobsChange', value: boolean): void
}>()

const strings = {
  noFilterValue: '-',
  createMonitoringTaskTitle: browser.i18n.getMessage('createMonitoringTaskTitle'),
  filterByJobName: browser.i18n.getMessage('filterByJobName'),
  showDisabledJobs: browser.i18n.getMessage('showDisabledJobs'),
  filterLabel: browser.i18n.getMessage('filterLabel'),
}

const creationModalVisible = ref(false)
const filteringResult = ref('')
const filteringJobName = ref('')
const filteringResults: SelectMixedOption[] = []
const showDisabledJobs = ref(true)


watch(showDisabledJobs, (newVal: boolean) => {
  StorageService.getOptions().then((options: Options) => {
    // console.log('showDisabledJobsChanged', options)
    options.showDisabledJobs = newVal
    StorageService.saveOptions(options)
    emit('showDisabledJobsChange', newVal)
  })
})

watchDebounced(filteringJobName,
  () => {
    emit('jobNameFilterChange', filteringJobName.value)
  },
  { debounce: 300, maxWait: 500 },
)

watch(filteringResult, (newVal: string) => {
  emit('resultFilterChange', newVal)
})

initResultFilter()

/**
 * 初始化结果过滤器
 */
function initResultFilter() {
  // 默认不过滤
  filteringResult.value = strings.noFilterValue
  filteringResults.push({
    value: strings.noFilterValue,
    label: strings.noFilterValue,
  })
  Object.keys(Tools.jobStatus).forEach((value) => {
    filteringResults.push({
      value,
      label: Tools.jobStatus[value],
    })
  })
}

function creationModalVisibleUpdate(value: boolean) {
  creationModalVisible.value = value
}
</script>

<template>
  <div class="monitor-op-area">
    <!-- 按Job名称过滤Job -->
    <n-input
      v-model:value="filteringJobName"
      :placeholder="strings.filterByJobName"
      class="search-input"
      size="small"
      clearable
    >
      <template #prefix>
        <n-icon :component="SearchOutline" />
      </template>
    </n-input>
    <!-- 按构建结果过滤Job -->
    <n-select
      v-model:value="filteringResult"
      size="small"
      class="filter-select"
      :placeholder="strings.filterLabel"
      :options="filteringResults"
    />
    <!-- 是否显示禁用的Job -->
    <n-checkbox
      v-model:checked="showDisabledJobs"
      size="small"
      class="show-disabled-checkbox items-center flex-1"
    >
      {{ strings.showDisabledJobs }}
    </n-checkbox>
    <!-- 创建新的监控任务 -->
    <div>
      <n-button
        circle
        size="small"
        type="primary"
        class="create-task-button"
        :title="strings.createMonitoringTaskTitle"
        @click="creationModalVisible = true"
      >
        <template #icon>
          <n-icon><add /></n-icon>
        </template>
      </n-button>
    </div>
    <!-- 创建监控任务的对话框 -->
    <CreationModal
      :show="creationModalVisible"
      @visible-update="creationModalVisibleUpdate"
    />
  </div>
</template>

<style lang="scss">
  .monitor-op-area {
    display: flex;

    .search-input {
      width: 50%;
    }

    .filter-select {
      margin-left: 10px;
      width: 20%;
    }

    .show-disabled-checkbox {
      margin-left: 10px;
    }

    .create-task-button {
      margin-left: 10px;
    }
  }
</style>
