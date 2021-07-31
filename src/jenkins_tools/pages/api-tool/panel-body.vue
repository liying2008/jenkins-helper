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
      <FormData v-show="selectedType === bodyTypeEnum.FormData" />
      <UrlEncodedForm v-show="selectedType === bodyTypeEnum.UrlEncodedForm" />
      <JsonData v-show="selectedType === bodyTypeEnum.Json" />
      <XmlData v-show="selectedType === bodyTypeEnum.Xml" />
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
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

@Component({
  name: 'PanelBody',
  components: {
    FormData,
    UrlEncodedForm,
    JsonData,
    XmlData,
  }
})
export default class PanelBody extends Vue {
  strings = {
  }

  bodyTypeEnum = BodyType
  selectedType: BodyType = BodyType.None
  bodyTypes = [
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

  selectedTypeChange() {
    // console.log('selectedTypeChange::', this.selectedType)
  }
}
</script>

<style lang="scss">
#api-tool-panel-body {
  .dense-radio-group {
    margin-top: 0;
    padding-top: 0;
  }
}
</style>
