<template>
  <div id="api-tool-panel-params">
    <v-container>
      <v-row>
        <v-col cols="3">
          <div class="ml-8">
            KEY
          </div>
        </v-col>
        <v-col cols="8">
          <div>VALUE</div>
        </v-col>
        <v-col cols="1">
          <div></div>
        </v-col>
      </v-row>
      <v-row
        v-for="(param, index) in params"
        :key="index"
        class="mt-2"
      >
        <v-col cols="3">
          <div class="d-flex">
            <v-checkbox
              v-model="param.enable"
              dense
              hide-details
              class="parameter-enable-cb"
            ></v-checkbox>
            <v-text-field
              v-model="param.key"
              dense
              hide-details
              placeholder="Key"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="8">
          <v-text-field
            v-model="param.value"
            dense
            hide-details
            placeholder="Value"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn
            v-if="index != params.length - 1"
            dense
            icon
            title="Remove this parameter"
            x-small
            class="parameter-remove-btn"
            color="grey"
            @click="deleteParam(index)"
          >
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { QueryParam } from './models'


@Component({
  name: 'PanelParams'
})
export default class PanelParams extends Vue {
  @Prop({ type: Array, required: true, default: [] }) readonly params!: Array<QueryParam>
  strings = {
  }

  @Watch('params', { deep: true })
  watchParams() {
    console.log('0-params', this.params)
    if (this.params.length === 0) {
      this.params.push(new QueryParam())
    }
    console.log('1-params', this.params)
    const paramsLength = this.params.length
    const lastItem = this.params[paramsLength - 1]
    if (lastItem.key !== '' || lastItem.value !== '') {
      this.params.push(new QueryParam())
    }
    this.$emit('params-changed', this.params)
  }

  mounted() {
  }

  /**
   * 删除指定位置的参数
   *
   * @param index 参数位置
   */
  deleteParam(index: number) {
    this.params.splice(index, 1)
  }

}
</script>

<style lang="scss">
#api-tool-panel-params {
  .parameter-enable-cb {
    margin-top: 4px;
  }
}
</style>
