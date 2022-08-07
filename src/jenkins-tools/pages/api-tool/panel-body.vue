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

const strings = {
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

function selectedTypeChange() {
  // console.log('selectedTypeChange::', this.selectedType)
}
</script>

<template>
  <div id="api-tool-panel-body">
    <v-container>
      <v-radio-group
        v-model="selectedType"
        dense
        hide-details
        row
        class="dense-radio-group"
        @change="selectedTypeChange"
      >
        <v-radio
          v-for="bodyType in bodyTypes"
          :key="bodyType.value"
          :label="bodyType.label"
          :value="bodyType.value"
        ></v-radio>
      </v-radio-group>
      <FormData v-show="selectedType === BodyType.FormData" />
      <UrlEncodedForm v-show="selectedType === BodyType.UrlEncodedForm" />
      <JsonData v-show="selectedType === BodyType.Json" />
      <XmlData v-show="selectedType === BodyType.Xml" />
    </v-container>
  </div>
</template>

<style lang="scss">
#api-tool-panel-body {
  .dense-radio-group {
    padding-top: 0;
    margin-top: 0;
  }
}
</style>
