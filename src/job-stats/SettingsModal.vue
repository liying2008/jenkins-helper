<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { t } from '~/libs/extension'
import { StorageService } from '~/libs/storage'
import { Options } from '~/models/option'

const props = defineProps<{
  show: boolean
}>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'close'): void
}>()

const strings = {
  ok: t('ok'),
  cancel: t('cancel'),
  jobStatsTitle: t('jobStatsTitle'),
  jobStatsTitleTip: t('jobStatsTitleTip'),
  jobStatsJenkinsPlaceholder: t('jobStatsJenkinsPlaceholder'),
  jobStatsJenkinsHint: t('jobStatsJenkinsHint'),
  jobStatsNodeParamTip: t('jobStatsNodeParamTip'),
  jobStatsNodeParamPlaceholder: t('jobStatsNodeParamPlaceholder'),
  jobStatsNodeParamHint: t('jobStatsNodeParamHint'),
  optionsSaved: t('optionsSaved'),
}

const message = useMessage()

const defaultOptionsValue = Options.default()

const jobStatsJenkinsUrl = ref(defaultOptionsValue.jobStatsJenkinsUrl)
const nodeParam = ref(defaultOptionsValue.nodeParam)

const modalVisible = computed({
  get() {
    return props.show
  },
  set(newVal) {
    if (!newVal) {
      emit('close')
    }
  },
})

onMounted(() => {
  StorageService.getOptions().then((options: Options) => {
    jobStatsJenkinsUrl.value = options.jobStatsJenkinsUrl
    nodeParam.value = options.nodeParam
  })
})

function submit() {
  StorageService.savePartialOptions({
    jobStatsJenkinsUrl: jobStatsJenkinsUrl.value,
    nodeParam: nodeParam.value,
  }).then(() => {
    message.success(strings.optionsSaved)
  })
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    preset="dialog"
    :title="strings.jobStatsTitle"
    :positive-text="strings.ok"
    :negative-text="strings.cancel"
    class="settings-dialog"
    style="width: 600px;"
    :mask-closable="false"
    :show-icon="false"
    @positive-click="submit"
    @negative-click="modalVisible = false"
  >
    <!-- Job统计设置 -->
    <n-card embedded>
      <div class="control-label">
        {{ strings.jobStatsTitleTip }}
      </div>
      <n-input
        v-model:value="jobStatsJenkinsUrl"
        type="textarea"
        :placeholder="strings.jobStatsJenkinsPlaceholder"
      />
      <div
        class="control-hint"
        v-html="strings.jobStatsJenkinsHint"
      >
      </div>

      <div class="control-label mt-14px">
        {{ strings.jobStatsNodeParamTip }}
      </div>
      <n-input
        v-model:value="nodeParam"
        type="text"
        :placeholder="strings.jobStatsNodeParamPlaceholder"
      />
      <div
        class="control-hint"
        v-html="strings.jobStatsNodeParamHint"
      >
      </div>
    </n-card>
  </n-modal>
</template>

<style lang="scss">
.settings-dialog {
  .control-label {
    margin-bottom: 6px;
  }

  .control-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #888888;
  }
}
</style>
