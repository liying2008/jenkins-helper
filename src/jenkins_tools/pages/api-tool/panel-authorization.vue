<template>
  <div id="api-tool-panel-authorization">
    <v-container>
      <v-text-field
        v-model="authorizationEntity.username"
        dense
        label="Username"
        :placeholder="strings.jenkinsUsernameInputPlaceholder"
        :title="strings.jenkinsUsernameInputPlaceholder"
        hide-details
        outlined
      ></v-text-field>

      <v-text-field
        v-model="authorizationEntity.password"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        dense
        label="Password"
        :placeholder="strings.jenkinsPasswordInputPlaceholder"
        :title="strings.jenkinsPasswordInputPlaceholder"
        class="mt-2"
        hide-details
        :type="showPassword ? 'text' : 'password'"
        outlined
        @click:append="showPassword = !showPassword"
      ></v-text-field>

      <v-checkbox
        v-model="authorizationEntity.useCrumb"
        dense
        hide-details
        label="Use Crumb"
      ></v-checkbox>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { AuthorizationEntity } from './models'

@Component({
  name: 'PanelAuthorization'
})
export default class PanelAuthorization extends Vue {
  @Prop({ type: AuthorizationEntity, required: true }) readonly authorizationEntity!: AuthorizationEntity

  strings = {
    jenkinsUsernameInputPlaceholder: 'Jenkins username',
    jenkinsPasswordInputPlaceholder: 'Jenkins password or api token',
  }
  // 是否显示密码
  showPassword = false

  @Watch('authorizationEntity', { deep: true })
  watchAuthorizationEntity(newVal: AuthorizationEntity) {
    this.$emit('authorization-changed', newVal)
  }
}
</script>

<style lang="scss">
#api-tool-panel-authorization {
  .full-width {
    width: 100%;
  }
}
</style>
