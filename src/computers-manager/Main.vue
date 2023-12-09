<script lang="ts" setup>
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { NA, NSwitch, useDialog, useMessage } from 'naive-ui'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { h, ref } from 'vue'
import { SearchSharp } from '@vicons/ionicons5'
import { watchDebounced } from '@vueuse/core'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import type { NodeDetail, Nodes } from '~/models/node'
import { t } from '~/libs/extension'

const strings = {
  close: t('close'),
  search: t('search'),
  yes: t('yes'),
  no: t('no'),
  save: t('save'),
  warmTip: t('warmTip'),
  monitored: t('monitored'),
  notMonitored: t('notMonitored'),
  diskSpaceThresholdInvalid: t('diskSpaceThresholdInvalid'),
  enableMonitoringOrNot: t('enableMonitoringOrNot'),
  fetchNodesDataFailure: t('fetchNodesDataFailure'),
  diskSpaceThreshold: t('diskSpaceThreshold'),
  inputJenkinsUrl: t('inputJenkinsUrl'),
  inputJenkinsUrlPlaceholder: t('inputJenkinsUrlPlaceholder'),
  getJenkinsNodesRawData: t('getJenkinsNodesRawData'),
  inputDiskSpaceThreshold: t('inputDiskSpaceThreshold'),
  displayName: t('displayName'),
  workingDirectory: t('workingDirectory'),
  remainingDiskSpace: t('remainingDiskSpace'),
  responseTime: t('responseTime'),
  isMonitoring: t('isMonitoring'),
  urlCannotEmpty: t('urlCannotEmpty'),
  urlInvalid: t('urlInvalid'),
  canNotBeEmpty: t('canNotBeEmpty'),
  diskSpaceThresholdMustGreaterThan0: t('diskSpaceThresholdMustGreaterThan0'),
  diskSpaceThresholdInputPlaceholder: t('diskSpaceThresholdInputPlaceholder'),
}

const formValue = ref({
  inputUrlValue: '',
})
const search = ref('')
const loading = ref(false)
const nodes = ref<NodeDetail[]>([])
const filteredNodes = ref<NodeDetail[]>([])
const monitoredNodes = ref<Nodes>({})
const url = ref('')
const thresholdModalVisible = ref(false)
const editedItem = ref<NodeDetail | null>(null)
const headers: TableColumns<NodeDetail> = [
  {
    title: strings.displayName,
    align: 'left',
    key: 'displayName',
    sorter: 'default',
    render(row) {
      return h(
        NA,
        {
          href: row.nodeUrl,
          target: '_blank',
          title: row.offline ? 'Offline' : '',
          class: 'jk-a-link-color',
        },
        { default: () => row.displayName },
      )
    },
  },
  {
    title: strings.workingDirectory,
    align: 'left',
    key: 'workingDirectory',
    sorter: 'default',
  },
  {
    title: strings.remainingDiskSpace,
    align: 'left',
    key: 'remainingDiskSpace',
    sorter: 'default',
  },
  {
    title: strings.responseTime,
    align: 'left',
    key: 'responseTime',
    sorter: 'default',
  },
  {
    title: strings.isMonitoring,
    align: 'left',
    key: 'monitoring',
    sorter: 'default',
    render(row) {
      return h(
        NSwitch,
        {
          value: row.monitoring,
          size: 'small',
          onUpdateValue: (newVal) => {
            // console.log('0--->', newVal)
            onMonitoringChange(row, newVal)
          },
        },
        { checked: () => strings.monitored, unchecked: () => strings.notMonitored },
      )
    },
  },
]

const message = useMessage()
const dialog = useDialog()
const formRef = ref<FormInst>()

const rules: FormRules = {
  inputUrlValue: [
    {
      required: true,
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          // 不能为空
          return new Error(strings.urlCannotEmpty)
        } else {
          const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
          const regex = new RegExp(expression)
          if (!regex.test(value)) {
            // 需要是一个合法的URL
            return new Error(strings.urlInvalid)
          }
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

const thresholdModalValueRules: FormRules = {
  value: [
    {
      required: true,
      validator(rule: FormItemRule, value: string) {
        value = value.trim()
        if (!value) {
          return new Error(strings.canNotBeEmpty)
        } else if (Number.parseFloat(value) <= 0) {
          return new Error(strings.diskSpaceThresholdMustGreaterThan0)
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

watchDebounced(search, () => {
  filter()
}, { debounce: 100, maxWait: 200 })

function getRowClass(item: NodeDetail) {
  const classNames = []
  if (item.offline) {
    classNames.push('offline-row')
  }
  if (item.monitoring) {
    classNames.push('monitored-row')
  }
  return classNames.join(' ')
}

getInitJenkinsUrl()

function getInitJenkinsUrl() {
  const _url = document.location.toString()
  console.log('getInitJenkinsUrl', url)
  const param = _url.split('?')[1]
  const jenkinsUrl = param.replace('jenkins=', '')
  if (jenkinsUrl) {
    formValue.value.inputUrlValue = jenkinsUrl
    startQuery()
  }
}

async function startQuery() {
  try {
    await formRef.value?.validate()
  } catch (e: unknown) {
    console.log('validate error', e)
    return
  }
  StorageService.getNodeStatus().then((result) => {
    console.log('monitoredNodes', result)
    monitoredNodes.value = result
    queryJenkinsNodes()
  })
}

/**
 * 查询Jenkins节点数据
 * @param jenkinsUrl
 */
function queryJenkinsNodes(jenkinsUrl?: string | undefined) {
  let _url = formValue.value.inputUrlValue
  if (jenkinsUrl === undefined) {
    _url = _url.charAt(_url.length - 1) === '/' ? _url : `${_url}/`
    url.value = _url
  } else {
    _url = jenkinsUrl
  }
  const encodeParam = encodeURI('computer[displayName,offline,monitorData[*]]')
  const jsonUrl = `${_url}computer/api/json?tree=${encodeParam}`

  Tools.getFetchOption(jsonUrl).then((header) => {
    getJenkinsNodeData(_url, jsonUrl, header)
  })
}

/**
 * 请求Jenkins节点数据
 * @param url
 * @param jsonUrl
 * @param header
 */
function getJenkinsNodeData(url: string, jsonUrl: string, header: any) {
  loading.value = true
  nodes.value = []
  // TODO 给fetch添加请求超时时间配置
  fetch(jsonUrl, header).then((res) => {
    if (res.ok) {
      return res.json()
    } else {
      return Promise.reject(res)
    }
  }).then((data) => {
    loading.value = false
    const computers = data.computer
    // console.log(computers)
    for (let i = 0; i < computers.length; i++) {
      const displayName = computers[i].displayName
      let nodeUrl = `${url}computer/${displayName}/`
      if (displayName === 'master') {
        nodeUrl = `${url}computer/(master)/`
      }
      let workingDirectory = 'N/A'
      let remainingDiskSpace = 'N/A'
      let responseTime = 'N/A'
      const offline = computers[i].offline
      if (!offline) {
        const diskSpaceMonitor = computers[i].monitorData['hudson.node_monitors.DiskSpaceMonitor']
        if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('path')) {
          workingDirectory = diskSpaceMonitor.path
        }
        let size
        if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('size')) {
          size = diskSpaceMonitor.size
        }
        if (size) {
          remainingDiskSpace = `${(size / 1024.0 / 1024.0 / 1024.0).toFixed(2)} GB`
        }
        const responseTimeMonitor = computers[i].monitorData['hudson.node_monitors.ResponseTimeMonitor']
        if (responseTimeMonitor && responseTimeMonitor.hasOwnProperty('average')) {
          responseTime = `${responseTimeMonitor.average}ms`
        }
      }
      let monitoring = false
      let diskSpaceThreshold = 0
      if (monitoredNodes.value.hasOwnProperty(url)) {
        if (monitoredNodes.value[url].hasOwnProperty('monitoredNodes')) {
          monitoring = monitoredNodes.value[url].monitoredNodes.hasOwnProperty(displayName)
          if (monitoring) {
            diskSpaceThreshold = monitoredNodes.value[url].monitoredNodes[displayName].diskSpaceThreshold
          }
        }
      }
      nodes.value.push({
        displayName,
        nodeUrl,
        workingDirectory,
        remainingDiskSpace,
        responseTime,
        monitoring,
        diskSpaceThreshold,
        offline,
      })
    }
    // console.log('nodes', nodes.value)
    filter()
  }).catch((e: Error) => {
    console.log('获取数据失败', e)
    loading.value = false
    message.error(strings.fetchNodesDataFailure)
  })
}

function filter() {
  const filterValue = search.value.trim()
  if (filterValue) {
    filteredNodes.value = nodes.value.filter((item) => {
      return item.displayName.includes(filterValue)
    })
  } else {
    filteredNodes.value = nodes.value
  }
}

function onMonitoringChange(item: NodeDetail, checked: boolean) {
  // console.log(item)
  editedItem.value = item
  const displayName = item.displayName
  if (checked) {
    // 开启监控
    thresholdModalVisible.value = true
  } else {
    // 取消监控
    dialog.warning({
      title: strings.warmTip,
      content: t('cancelMonitoringNode', [displayName]),
      positiveText: strings.yes,
      negativeText: strings.no,
      onPositiveClick: () => {
        delete monitoredNodes.value[url.value].monitoredNodes[displayName]
        // 保存监控配置
        StorageService.saveNodeStatus(monitoredNodes.value).then(() => {
          item.monitoring = false
          message.success(t('monitoringCancelled', [displayName]))
        })
      },
    })
  }
}

function onThresholdValueSubmit(value: string, validation: boolean) {
  console.log(value, validation)
  if (!validation) {
    // 数据不合法
    return
  }
  const item = editedItem.value!
  console.log(item)
  const displayName = item.displayName
  // 开启监控
  if (!monitoredNodes.value.hasOwnProperty(url.value)) {
    monitoredNodes.value[url.value] = {
      status: 'ok',
      monitoredNodes: {},
    }
  }

  const diskSpaceThreshold = Number.parseFloat(value)
  monitoredNodes.value[url.value].monitoredNodes[displayName] = {
    displayName,
    nodeUrl: item.nodeUrl,
    workingDirectory: item.workingDirectory,
    remainingDiskSpace: item.remainingDiskSpace,
    responseTime: item.responseTime,
    monitoring: true,
    diskSpaceThreshold,
    offline: item.offline,
  }

  // 保存监控配置
  StorageService.saveNodeStatus(monitoredNodes.value).then(() => {
    item.monitoring = true
  })

  thresholdModalVisible.value = false
}

function onThresholdValueCancel() {
  thresholdModalVisible.value = false
  if (editedItem.value?.monitoring) {
    editedItem.value!.monitoring = false
  }
}
</script>

<template>
  <div class="computer-manager-wrapper">
    <n-card class="form-card">
      <n-form
        ref="formRef"
        inline
        :model="formValue"
        :rules="rules"
        size="medium"
        class="flex"
        @submit.prevent="startQuery"
      >
        <n-form-item
          :label="strings.inputJenkinsUrl"
          path="inputUrlValue"
          class="flex-1"
        >
          <n-input
            v-model:value="formValue.inputUrlValue"
            :placeholder="strings.inputJenkinsUrlPlaceholder"
          />
        </n-form-item>
        <n-form-item>
          <n-button
            attr-type="button"
            type="primary"
            @click="startQuery"
          >
            {{ strings.getJenkinsNodesRawData }}
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>
    <div
      v-show="nodes.length > 0"
      class="computers-table"
    >
      <n-input
        v-model:value="search"
        round
        clearable
        :placeholder="strings.search"
      >
        <template #suffix>
          <n-icon :component="SearchSharp" />
        </template>
      </n-input>

      <n-data-table
        size="small"
        class="mt-14px"
        :loading="loading"
        :columns="headers"
        :data="filteredNodes"
        :row-class-name="getRowClass"
      />
    </div>
    <PromptModal
      :show="thresholdModalVisible"
      :title="strings.diskSpaceThreshold"
      :label="strings.inputDiskSpaceThreshold"
      :placeholder="strings.diskSpaceThresholdInputPlaceholder"
      input-type="number"
      :rules="thresholdModalValueRules"
      @visible-update="thresholdModalVisible = $event"
      @submit="onThresholdValueSubmit"
      @cancel="onThresholdValueCancel"
    />
  </div>
</template>

<style lang="scss">
.computer-manager-wrapper {
  padding: 20px 30px;

  .form-card {
    .n-card__content {
      padding: 10px 16px;
      padding-bottom: 6px;
    }
  }

  .computers-table {
    margin-top: 20px;

    .offline-row > td {
      background-color: var(--jk-offlineline);
    }

    .monitored-row > td {
      background-color: var(--jk-monitoredline);
    }
  }
}
</style>
