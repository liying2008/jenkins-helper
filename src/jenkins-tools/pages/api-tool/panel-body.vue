<script lang="ts" setup>
import { ref } from 'vue'
import FormData from './request-body/form-data.vue'
import UrlEncodedForm from './request-body/urlencoded-form.vue'
import JsonData from './request-body/json-data.vue'
import XmlData from './request-body/xml-data.vue'

enum BodyType {
  None = 'none',
  FormData = 'form-data',
  UrlEncodedForm = 'x-www-form-urlencoded',
  Json = 'json',
  Xml = 'xml',
}

const selectedType = ref<BodyType>(BodyType.None)
const bodyTypes = [
  {
    label: BodyType.None,
    value: BodyType.None,
  },
  {
    label: BodyType.FormData,
    value: BodyType.FormData,
  },
  {
    label: BodyType.UrlEncodedForm,
    value: BodyType.UrlEncodedForm,
  },
  {
    label: BodyType.Json,
    value: BodyType.Json,
  },
  {
    label: BodyType.Xml,
    value: BodyType.Xml,
  },
]
</script>

<template>
  <div id="api-tool-panel-body">
    <n-radio-group
      v-model:value="selectedType"
      name="radiogroup"
    >
      <n-space>
        <n-radio
          v-for="bodyType in bodyTypes"
          :key="bodyType.value"
          :label="bodyType.label"
          :value="bodyType.value"
        >
        </n-radio>
      </n-space>
    </n-radio-group>
    <FormData v-show="selectedType === BodyType.FormData" />
    <UrlEncodedForm v-show="selectedType === BodyType.UrlEncodedForm" />
    <JsonData v-show="selectedType === BodyType.Json" />
    <XmlData v-show="selectedType === BodyType.Xml" />
  </div>
</template>

<style lang="scss">
#api-tool-panel-body {
}
</style>
